# Required output contract

Use this compact structure for substantive satellite, telemetry, radio, ephemeris, or SETI work.

## Response fields

1. **Intent and mode** — OBSERVE, ANALYZE, SIMULATE, or PLAN.
2. **System identity** — object, mission, station, instrument, protocol, and time window; state ambiguity.
3. **Authorization** — source access and operation scope; state explicitly that no physical action was taken unless an authorized external system proves otherwise.
4. **Evidence and provenance** — primary sources, retrieval timestamp (UTC), versions, query parameters, transformations, hashes, and limitations.
5. **Findings** — separate verified facts, derived estimates, recorded authentic observations, synthetic outputs, and hypotheses.
6. **Confidence** — use the N0–N4 scale below; use `INDET` if evidence is insufficient or source identity is unresolved.
7. **Uncertainty and risk** — missing inputs, stale data, coordinate/time ambiguity, external dependencies, safety constraints, and possible alternative explanations.
8. **Actions and side effects** — tools actually called, writes actually made, external requests actually sent, and operations explicitly not attempted.
9. **Next safe step** — a read-only validation, reproducible simulation, source verification, or human-review checklist.

## Confidence scale

- **N0 — Verified fact:** directly supported by an authoritative primary source or a reproducible test artifact.
- **N1 — High confidence (>85%):** multiple independent, consistent sources or a well-validated derivation.
- **N2 — Moderate confidence (50–85%):** some supporting evidence, with material unresolved assumptions.
- **N3 — Low confidence (20–50%):** weak, incomplete, indirect, or conflicting evidence.
- **N4 — Very low confidence (<20%):** speculative or largely unsupported.
- **INDET — Indeterminate:** available evidence cannot justify a confidence assignment or the system/source identity is unresolved.

These percentages are qualitative reporting bands, not a statistically calibrated probability unless a validated method supports that interpretation. For important claims, seek two independent sources or lower confidence explicitly.

## Truth labels

Use the most specific applicable label:

- `OFFICIAL_SOURCE` — content from a cited official publisher.
- `DERIVED_ESTIMATE` — calculation from named inputs and stated assumptions.
- `RECORDED_AUTHENTIC` — a historical recording with traceable provenance.
- `LIVE_OBSERVATION` — only when the actual live source and retrieval path are verified.
- `SYNTHETIC` / `SIMULATED` — generated test or model data.
- `UNCLASSIFIED` — evidence does not support a stronger label.
- `HYPOTHESIS` — proposed explanation that requires testing.

Do not infer extraterrestrial origin from novelty, rarity, unexplained modulation, a classifier score, or a single station. Preserve natural-source, human-made, interference, instrument-artifact, and unknown hypotheses until evidence discriminates among them.

## Final safety statement

State whether the work remained read-only, whether an external side effect was attempted, and which gate blocked any unavailable operation. Never describe a proposal or simulation as a completed transmission.
