# Disturbance-Gated Torque-Memory ILC for Quadruped Locomotion

This repository implements the proposed research-gap experiment from the supplied paper:

> **When should a quadruped ILC controller quarantine a corrupted trial instead of writing its tracking error into persistent torque memory?**

The code is a compact, reproducible simulation of a phase-indexed quadruped joint controller. It compares:

1. **Baseline PD-ILC** — every trial updates feedforward torque.
2. **Disturbance-gated PD-ILC** — updates are down-weighted or rejected using only controller-visible signals: tracking innovation, contact inconsistency, and saturation.

The model is intentionally transparent rather than a replacement for MuJoCo. It captures the research mechanism directly: repeated phase-indexed motion, feedback plus feedforward memory, one-off slip/push disturbances, and contamination of the next trial by a bad update.

## Run

```bash
cd research
python3 run_experiment.py --seed 7 --trials 35
```

Outputs are written to `results/`:

- `comparison.png` — error curves, disturbance event, memory corruption, and gating score.
- `metrics.json` — RMSE and contamination metrics.
- `trial_data.npz` — raw arrays for re-analysis.

The default experiment includes a one-off disturbance at trial 16 and a second disturbance type at trial 27. It also runs a noisy-observation gate so the main result does not rely on hidden simulator force.

## Core update

For phase sample `s`, the baseline is:

```text
u_ff[k+1,s] = u_ff[k,s] + alpha * (Kp*e[k,s+lookahead] + Kd*edot[k,s+lookahead])
```

The proposed update is:

```text
q[k,s] = clip((1 - d[k]) * c[k,s] * (1 - sat[k,s]), 0, 1)
u_ff[k+1,s] = u_ff[k,s] + alpha * q[k,s] * update[k,s]
```

`d` is a trial-level disturbance score from innovation residual and motion anomaly. `c` is phase-local contact consistency. No external-force ground truth is used by the controller.

## Research interpretation

This is a **memory-hygiene contribution**, not a new gait generator, RL policy, or torque library. The correct claim is narrower: a confidence-gated update can prevent non-repetitive disturbances from becoming persistent feedforward torque. The experiment includes an ablation with oracle disturbance information only as a diagnostic; the primary result uses noisy controller-visible signals.

## Animation

The Manim source is `video.py`. Render it with Manim Community Edition after installing Manim:

```bash
manim -pqh video.py GatedILCExplanation
```

The animation explains the baseline update, a corrupted trial, the confidence gate, and the resulting memory trajectories.

## Rendered artifact

The validated explanation video is `gated_ilc_explanation.mp4`.
