# Scene plan

## Overview
A short educational animation for a control-systems presentation. It explains why ordinary phase-indexed ILC can store a one-off slip/push disturbance and how a controller-visible confidence gate prevents memory contamination.

## Narrative arc
1. Repeated quadruped gait and phase-indexed torque memory.
2. Baseline PD-ILC update.
3. A corrupted trial writes a large residual into memory.
4. Disturbance score and contact consistency produce a gate.
5. Baseline versus gated memory and the experimental claim.

## Scenes

### Scene 1 — `MemoryLoop`
- Duration: 6 seconds
- Purpose: establish repeated trials and phase-indexed feedforward memory.
- Visuals: phase axis, stored torque curve, trial counter.

### Scene 2 — `BaselineUpdate`
- Duration: 7 seconds
- Purpose: show the ordinary PD-ILC rule.
- Visuals: equation and error-to-memory arrow.

### Scene 3 — `CorruptedTrial`
- Duration: 7 seconds
- Purpose: show a one-off push/slip creating a large error and bad update.
- Visuals: red disturbance pulse and memory curve changing.

### Scene 4 — `GatedUpdate`
- Duration: 8 seconds
- Purpose: show disturbance score, contact consistency, quality weight, and gated update.
- Visuals: q = clip((1-d)c), crossed-out corrupted update.

### Scene 5 — `Comparison`
- Duration: 7 seconds
- Purpose: state the experiment and expected result without claiming hardware validity.
- Visuals: two trajectories and concise conclusion.

## Audio Sync
None. This animation is designed for live narration by the student.
