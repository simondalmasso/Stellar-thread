# Testing

## Commands

- `npm run catalog:verify` — validate the checked-in catalog SHA, normalized snapshot, generated application copy and change report.
- `npm run audit:secrets` — scan tracked project files for common secret patterns.
- `npm run licenses` — generate the dependency license inventory.
- `npm run test:core` — TypeScript core tests.
- `npm run test:python` — Python unittest suite through the guarded test runner.
- `npm run typecheck` — TypeScript project checks.
- `npm run build` — production frontend/Worker build.
- `npm run test:worker` — Worker smoke tests; start the local Worker first.
- `npm run test:e2e` — Playwright desktop/mobile browser tests.

## Evidence limits

The CI Worker integration runs D1 migrations and the encode → proposal → proof → propagation → restart/reload path against **local D1**. It does not prove that production D1 is bound, provisioned or migrated. The production Wrangler config currently has no D1 binding.

The Voyager control workflow downloads the public recorded radio-astronomy observation, hashes the parent file, derives the preview and verifies deterministic replay. This validates the derived artifact's provenance; it does not make it live telemetry or an extraterrestrial signal.

Automated coverage includes CMP exact round-trip, recoverable and unrecoverable corruption, EME latency, reply horizon, no automatic ET confirmation, live-heartbeat truth, deterministic IQ, narrowband/drift, no-signal, on/off RFI rejection, on-source preservation, multi-station coincidence, NPY/SigMF import, CLI replay and desktop/mobile browser smoke tests. Tests and artifacts must be tied to the exact commit SHA and tree SHA; old artifacts are not evidence for a newer commit.

## Manual acceptance

- Review relative links in `README.md` and `docs/INDEX.md` against the branch tree.
- Keep recorded, derived, synthetic, human-reviewed, stale and unavailable states separate.
- Do not add skips to hide applicable failures.
