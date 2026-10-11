#!/usr/bin/env python3
"""Reproducible toy quadruped phase-indexed ILC experiment.

The plant is four coupled joint channels with phase-dependent inertia and
contact stiffness. The point is to isolate memory contamination, not to claim
full-body MuJoCo fidelity.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt


def clip(x, lo, hi):
    return np.minimum(np.maximum(x, lo), hi)


def reference(phase: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    # Four legs with diagonal pairs in anti-phase; smooth swing/stance motion.
    offsets = np.array([0.0, np.pi, np.pi, 0.0])[:, None]
    q = 0.48 * np.sin(2 * np.pi * phase[None, :] + offsets)
    q += 0.12 * np.sin(4 * np.pi * phase[None, :] + offsets)
    dq = 2 * np.pi * (0.48 * np.cos(2 * np.pi * phase[None, :] + offsets)
                      + 2 * 0.12 * np.cos(4 * np.pi * phase[None, :] + offsets))
    return q, dq


def simulate_trial(ff, qref, dqref, phase, rng, disturbance=None):
    n = qref.shape[1]
    dt = 0.01
    q = np.zeros(4); dq = np.zeros(4)
    q_hist = np.zeros_like(qref); dq_hist = np.zeros_like(dqref)
    u_hist = np.zeros_like(qref); innov_hist = np.zeros_like(qref)
    contact_hist = np.zeros_like(qref); sat_hist = np.zeros_like(qref)
    planned_contact = (np.sin(2 * np.pi * phase) > -0.15).astype(float)
    for i in range(n):
        # A phase-varying low-order joint-space approximation of stance/swing.
        inertia = 1.0 + 0.20 * np.sin(2 * np.pi * phase[i])
        contact_k = 2.0 + 5.0 * planned_contact[i]
        fb = 20.0 * (qref[:, i] - q) + 1.7 * (dqref[:, i] - dq)
        u = clip(ff[:, i] + fb, -8.0, 8.0)
        ext = np.zeros(4)
        actual_contact = planned_contact[i]
        if disturbance and disturbance["start"] <= i < disturbance["end"]:
            if disturbance["kind"] == "push":
                ext[[0, 2]] = disturbance["magnitude"]
            elif disturbance["kind"] == "slip":
                actual_contact = 1.0 - planned_contact[i]
                ext[[1, 3]] = disturbance["magnitude"] * np.sin(10 * phase[i])
        # Small sensor/plant noise is included in the observed signals.
        model_acc = (u - 0.22 * dq - contact_k * (q - qref[:, i])) / inertia
        acc = model_acc + ext + rng.normal(0, 0.035, 4)
        dq += dt * acc
        q += dt * dq
        q_hist[:, i], dq_hist[:, i], u_hist[:, i] = q, dq, u
        innov_hist[:, i] = np.abs(acc - (u - 0.22 * dq - contact_k * (q - qref[:, i])) / inertia)
        contact_hist[:, i] = actual_contact
        sat_hist[:, i] = (np.abs(u) > 7.95).astype(float)
    return {"q": q_hist, "dq": dq_hist, "u": u_hist, "innov": innov_hist,
            "contact": contact_hist, "sat": sat_hist, "planned": planned_contact}


def run_controller(gated: bool, seed: int, trials: int):
    rng = np.random.default_rng(seed)
    phase = np.linspace(0, 1, 240, endpoint=False)
    qref, dqref = reference(phase)
    ff = np.zeros_like(qref)
    all_rmse, all_gate, all_mem, all_dist = [], [], [], []
    trial_logs = []
    disturbances = {15: {"start": 75, "end": 145, "kind": "push", "magnitude": 4.6},
                    26: {"start": 120, "end": 205, "kind": "slip", "magnitude": 3.7}}
    for k in range(trials):
        trial = simulate_trial(ff, qref, dqref, phase, rng, disturbances.get(k))
        e = qref - trial["q"]
        edot = dqref - trial["dq"]
        rmse = float(np.sqrt(np.mean(e * e)))
        # Controller-visible quality score; innovation is normalized against a
        # robust nominal scale, and contact mismatch is phase-local.
        innovation_score = clip(np.mean(trial["innov"], axis=0) / 0.48, 0, 1)
        trial_dist = float(clip(np.mean(innovation_score) + 0.35 * np.mean(trial["sat"]), 0, 1))
        contact_consistency = 1.0 - np.abs(trial["contact"] - trial["planned"][None, :])
        phase_quality = clip((1.0 - trial_dist) * contact_consistency * (1.0 - trial["sat"]), 0, 1)
        if gated:
            gate = phase_quality
        else:
            gate = np.ones_like(e)
        # One-sample phase lead as in the cited PD-ILC family.
        update = 0.11 * (20.0 * np.roll(e, -2, axis=1) + 1.7 * np.roll(edot, -2, axis=1))
        update[:, -2:] = 0
        ff = clip(ff + gate * update, -7.5, 7.5)
        all_rmse.append(rmse)
        all_gate.append(float(np.mean(gate)))
        all_mem.append(float(np.sqrt(np.mean(ff * ff))))
        all_dist.append(trial_dist)
        trial_logs.append(trial)
    # Contamination: memory growth immediately after known corrupted trials.
    return {"phase": phase, "qref": qref, "rmse": np.array(all_rmse),
            "gate": np.array(all_gate), "memory": np.array(all_mem),
            "dist_score": np.array(all_dist), "ff": ff, "logs": trial_logs}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--trials", type=int, default=35)
    args = ap.parse_args()
    out = Path(__file__).parent / "results"
    out.mkdir(exist_ok=True)
    base = run_controller(False, args.seed, args.trials)
    gate = run_controller(True, args.seed, args.trials)
    t = np.arange(args.trials)
    fig, ax = plt.subplots(2, 2, figsize=(13, 8), constrained_layout=True)
    ax[0, 0].plot(t + 1, base["rmse"], label="Baseline PD-ILC", lw=2)
    ax[0, 0].plot(t + 1, gate["rmse"], label="Disturbance-gated", lw=2)
    ax[0, 0].axvspan(15.5, 16.5, color="tab:red", alpha=.15, label="one-off push")
    ax[0, 0].axvspan(26.5, 27.5, color="tab:orange", alpha=.15, label="slip")
    ax[0, 0].set(title="Tracking RMSE by trial", xlabel="Trial", ylabel="RMSE (rad)"); ax[0, 0].legend()
    ax[0, 1].plot(t + 1, base["memory"], label="Baseline", lw=2)
    ax[0, 1].plot(t + 1, gate["memory"], label="Gated", lw=2)
    ax[0, 1].set(title="Stored feedforward torque magnitude", xlabel="Trial", ylabel="RMS torque"); ax[0, 1].legend()
    ax[1, 0].plot(t + 1, gate["gate"], color="tab:green", lw=2)
    ax[1, 0].plot(t + 1, gate["dist_score"], color="tab:red", ls="--", label="disturbance score")
    ax[1, 0].set(title="Gate protects memory on corrupted trials", xlabel="Trial", ylabel="score / weight"); ax[1, 0].legend()
    ph = base["phase"]
    ax[1, 1].plot(ph, base["ff"][0], label="Baseline final memory")
    ax[1, 1].plot(ph, gate["ff"][0], label="Gated final memory")
    ax[1, 1].set(title="Final phase-indexed memory (joint 1)", xlabel="Gait phase", ylabel="feedforward torque"); ax[1, 1].legend()
    fig.suptitle("Disturbance-Gated Torque-Memory ILC", fontsize=16)
    fig.savefig(out / "comparison.png", dpi=180)
    metrics = {
        "seed": args.seed, "trials": args.trials,
        "baseline_mean_rmse_last10": float(np.mean(base["rmse"][-10:])),
        "gated_mean_rmse_last10": float(np.mean(gate["rmse"][-10:])),
        "baseline_rmse_after_push": float(base["rmse"][16]),
        "gated_rmse_after_push": float(gate["rmse"][16]),
        "baseline_memory_after_push": float(base["memory"][16]),
        "gated_memory_after_push": float(gate["memory"][16]),
        "gated_mean_weight_push_trial": float(gate["gate"][15]),
        "gated_mean_weight_slip_trial": float(gate["gate"][26]),
    }
    (out / "metrics.json").write_text(json.dumps(metrics, indent=2))
    np.savez(out / "trial_data.npz", phase=ph, base_rmse=base["rmse"], gated_rmse=gate["rmse"],
             base_memory=base["memory"], gated_memory=gate["memory"], gate=gate["gate"],
             dist_score=gate["dist_score"], base_ff=base["ff"], gated_ff=gate["ff"])
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
