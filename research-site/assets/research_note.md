# Disturbance-Gated Torque-Memory ILC for Quadruped Locomotion

## The overlooked implementation gap

The most defensible gap in the supplied proposal is not “ILC for quadrupeds.” That already exists. The narrower missing implementation is a **memory-update decision**: when a repeated gait trial contains a one-off push, slip, missed contact, or sensor anomaly, should its tracking error be written into the persistent phase-indexed feedforward torque profile?

The closest recent legged-robot work uses a feedback-plus-feedforward ILC law, offline zero-phase filtering, and a torque library that reuses profiles across task metadata. It explicitly reports sensitivity to filter design and limitations of linear interpolation, but it does not isolate a trial-confidence or corruption-quarantine rule for deciding whether a bad trial should update the memory [1]. The older planar quadruped study combines robust feedback with PD-type ILC and models slipping and rough terrain as additive disturbances; its update law still learns from the trial error rather than treating the trial as potentially unrepresentative [2].

This matters because standard ILC is strongest when disturbances are repetitive or predictable. A recent non-repetitive-disturbance ILC paper makes the broader issue explicit: non-repetitive disturbances challenge set achievement and require additional feedback and robustness mechanisms [3]. The implementation here applies that concern to the quadruped torque-memory boundary, using signals that a controller could observe rather than hidden simulator force.

## Proposed algorithm

Let `tau_k(s)` be the phase-indexed feedforward torque memory, `e_k(s)` the position error, and `edot_k(s)` the velocity error. The baseline PD-ILC update is

```text
tau_(k+1)(s) = tau_k(s) + alpha [Kp e_k(s + delta) + Kd edot_k(s + delta)]
```

The proposed gate computes a trial disturbance score `d_k` from innovation residual and actuator saturation, and a phase-local contact-consistency score `c_k(s)` from planned versus observed contact. The update confidence is

```text
q_k(s) = clip((1 - d_k) c_k(s) (1 - saturation_k(s)), 0, 1)
```

and the update becomes

```text
tau_(k+1)(s) = tau_k(s) + alpha q_k(s) [Kp e_k(s + delta) + Kd edot_k(s + delta)]
```

When the trial looks corrupted, `q` approaches zero, so the controller keeps its previous memory and quarantines the trial for analysis. This is a **memory-hygiene layer**, not a new gait generator, an RL policy, or a replacement for whole-body control.

## What is implemented

`run_experiment.py` contains a transparent four-joint phase-indexed simulation. Each joint follows a repeated gait trajectory. The plant includes phase-varying inertia, stance-like contact stiffness, feedback PD control, torque saturation, and noise. Trial 16 receives a one-off push and trial 27 receives a slip/contact inconsistency. The controller is evaluated in two otherwise identical conditions:

- **Baseline PD-ILC:** `q = 1` for every sample.
- **Disturbance-gated PD-ILC:** `q` is computed from noisy controller-visible signals.

The experiment is intentionally smaller than a full MuJoCo quadruped so that the mechanism is auditable in a classroom demonstration. A strong follow-up would port the exact update layer to A1 in MuJoCo or Isaac Gym and use estimated contact forces and base innovation residuals.

## Reproducible result

With seed 7 and 35 trials, the default run reports:

- baseline final memory RMS: **6.69**
- gated final memory RMS: **3.62**
- baseline memory RMS immediately after the push: **6.15**
- gated memory RMS immediately after the push: **2.57**
- mean gate weight on the push trial: **0.21**
- mean gate weight on the slip trial: **0.07**

The current toy plant does **not** show a large RMSE advantage for gating. That is a useful result rather than a failure: the gate trades some learning aggressiveness for protection against writing an atypical residual into memory. The result supports claiming reduced memory contamination, not universal tracking improvement. The next experiment should sweep disturbance frequency, gate threshold, observation noise, and learning rate, and should report both RMSE and memory deviation.

## Presentation claim

A defensible sentence for the teacher is:

> “I implemented and tested a disturbance-gated update layer for phase-indexed quadruped ILC. Unlike ordinary PD-ILC, it uses innovation, contact consistency, and saturation to down-weight or quarantine corrupted trials before they update persistent torque memory.”

Do not claim that the work proves hardware readiness or a new globally convergent controller. The present implementation is a simulation proof-of-concept and an experiment design for a more realistic A1/MuJoCo study.

## References

[1]: https://arxiv.org/html/2507.13662 "Iteratively Learning Muscle Memory for Legged Robots to Improve Locomotion Adaptability"

[2]: https://skoge.folk.ntnu.no/prost/proceedings/ifac11-proceedings/data/html/papers/3378.pdf "Modeling and Robust Iterative Learning Control of a Planar Eight-Degrees of Freedom Quadruped Robot"

[3]: https://experts.umn.edu/en/publications/set-to-set-iterative-learning-control-for-non-repetitive-disturba/ "Set-to-Set Iterative Learning Control for Non-Repetitive Disturbances"

[4]: https://juliacontrol.github.io/ControlSystems.jl/dev/examples/ilc/ "ControlSystems.jl Iterative Learning Control example"

[5]: https://baggepinnen.github.io/IterativeLearningControl2.jl/dev/ "IterativeLearningControl2.jl algorithms and implementation documentation"
