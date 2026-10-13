# Architecture

```text
PUBLIC_WEB (React / Vite / Three.js)
    ↕ HTTPS JSON / SSE
Cloudflare Worker API
    ├── target / thread / message services
    ├── D1-backed ledger when DB binding is present
    ├── truth / provenance serialization
    └── transmission proposal export (no TX control)

OBSERVATORY_INGEST (adapter contract)
    ↕ SigMF / NPY / Filterbank / HDF5 / GUPPI RAW
cosmic-listener (Python DSP)
    ├── validation + provenance
    ├── STFT / channelization
    ├── drift / periodicity / burst searches
    ├── on/off-source RFI
    └── multi-station coincidence
```

## Persistence: actual configuration

The Worker uses the D1 binding `DB` as the authority for messages, proposals, proofs, observations, candidate reviews, and write-rate buckets. The migrations are under `migrations/`.

- `wrangler.local.jsonc` defines a local D1 binding used by development and CI integration tests.
- **`wrangler.jsonc` currently does not define a `DB` binding.** Production D1 is therefore not configured or verified.
- If the binding is absent, persistence-dependent Worker routes fail with `503 D1 persistence unavailable`; the application does not silently fall back to an in-memory map, KV, or localStorage ledger.
- CI success proves the local D1 path and migration behavior only. It does not prove that a production D1 database exists or has been migrated.

Do not provision or migrate a remote database without explicit authorization. A production binding must reference a real, reviewed database before a deployment can claim persistent operation.

## Trust and operational boundaries

`PUBLIC_WEB`, `OBSERVATORY_INGEST`, `OPERATOR_CONSOLE`, and `TRANSMISSION_EXPORT` are separate concepts. Operator-only writes require the configured Bearer token. The public Worker has no endpoint to control SDR transmitters, amplifiers, high-power RF equipment, spacecraft command links, or lasers.

The SSE demonstration is a `SYNTHETIC TEST STREAM`; it is not an observatory feed. A missing or stale observatory heartbeat cannot be labeled LIVE. Voyager's recorded radio-astronomy observation is a human technological control, not engineering telemetry.

## Scientific truth

This architecture distinguishes official published status, derived estimates, authentic recorded observations, synthetic fixtures, human review, stale data, and unavailable data. A signal score or hash does not establish extraterrestrial origin or prove that a physical transmission occurred.
