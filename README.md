# Stellar Thread

**Open-source interstellar messaging simulator and radio-astronomy DSP lab with reproducible data, propagation models, and explicit no-transmission safety gates.**

Stellar Thread is a proposed research-software project for encoding hypothetical interstellar messages, modelling light-time, and examining radio-astronomy data with explicit provenance. It is not a real communications service.

## Capability status

| State | What it means here |
|---|---|
| **Implemented and CI-tested** | CMP-1 encoder/decoder; deterministic propagation model; Cloudflare Worker routes; D1 migrations and local-D1 integration tests; Python DSP pipeline; reproducible Voyager 1 radio-observation control and derived preview; desktop/mobile browser tests. These capabilities are present on this PR branch, not yet in `main`. |
| **Experimental** | Candidate-ranking heuristics, the versioned nearby-target snapshot, and the Moon Relay ephemeris path. They are research features, not validated operational systems. |
| **Not connected** | Production D1: `wrangler.jsonc` currently has no `DB` binding. Only `wrangler.local.jsonc` binds local D1 for CI/development. No live observatory or DSN feed is connected. No public Voyager engineering telemetry is available to this app. |
| **Unavailable** | Voyager command/uplink channel, spacecraft repair/control, physical RF transmission, and optical emission. No such operation has been performed. |

## Reality V2

- Five primary areas: `THREADS`, `UNIVERSE`, `LISTEN`, `LAB`, and `MISSION`.
- D1-backed persistence is exercised by local Worker/CI tests. When the `DB` binding is absent, persistence-dependent routes return `503`; there is no in-memory or browser-storage substitute for the authoritative ledger.
- A message stays in preparation states until an authorized operator registers a valid persisted `TransmissionProof`. Hashes prove byte integrity, not that a physical event happened.
- Propagation uses a persisted UTC timestamp, catalog distance, and `c = 299,792,458 m/s`. Animation does not change scientific state.
- The nearby-target catalog is a versioned snapshot, not a live catalog query. `npm run catalog:verify` checks its normalized and generated copies.
- CMP-1 uses CRC-32, SHA-256 and FEC repetition-3; other repetition values are rejected.
- The public Voyager 1 control is a recorded 2016 radio-astronomy observation of a known human-made spacecraft. It is classified `RECORDED_AUTHENTIC`, `HUMAN_TECHNOLOGICAL_CONTROL`, and `extraterrestrial=false`. It is not engineering telemetry and does not provide a command channel.
- The Moon Relay mean-distance mode is educational. The experimental ephemeris path validates inputs and is rate-limited in D1-backed mode; it is disabled in the free `STATIC_READ_ONLY` deployment pending upstream-policy and caching review. It is not approved for operational EME planning.
- Synthetic demonstrations remain labeled synthetic. No coverage is claimed without verified observation records.

## Operational truth

```text
PR_IMPLEMENTATION=MERGED_TO_MAIN
PRODUCTION_DEPLOYMENT_MODE=STATIC_READ_ONLY
PRODUCTION_D1_BINDING=ABSENT
LIVE_OBSERVATORY_CONNECTED=NO
VOYAGER_ENGINEERING_TELEMETRY=NOT_CONNECTED
VOYAGER_COMMAND_CHANNEL=NOT_AVAILABLE
PHYSICAL_RF_TRANSMISSION=NOT_PERFORMED
OPTICAL_EMISSION=NOT_PERFORMED
```

The local D1 migration path is `npm run db:migrate:local`. The free deployment workflow publishes the dashboard in `STATIC_READ_ONLY` mode after main CI succeeds; it does not create, delete, or bind a production D1 database. Verify `/api/v1/build` and `/api/v1/health` against the deployed source SHA before treating a release as live. The separate D1-backed workflow remains manual and gated.

## Reproducible development

```bash
npm ci
npm run db:migrate:local
npm run dev
```

In a second terminal, run the local Worker with a **dummy local token only**:

```bash
npx wrangler dev --local --config wrangler.local.jsonc --port 8787 --var OPERATOR_API_TOKEN:test-operator-token
```

DSP:

```bash
python -m pip install -c listener/constraints.txt -e ./listener
cosmic-listener doctor
cosmic-listener observe --synthetic --duration 4 --output artifacts/candidate.json
```

## Verification commands

```bash
npm run catalog:verify
npm run audit:secrets
npm run licenses
npm run test:core
npm run test:python
npm run typecheck
npm run build
npm run test:worker
npm run test:e2e
```

`npm run test:worker` requires the local Worker to be running. CI uses a local D1 database and is not evidence that production D1 is configured.

## Documentation

Start at [docs/INDEX.md](docs/INDEX.md). The source and generated-data relationships are documented there and in [Data Sources](docs/DATA_SOURCES.md), [Product Truth](docs/PRODUCT_TRUTH.md), and [Deployment](docs/DEPLOYMENT.md).

## Safety boundary

This software has no public transmitter-control endpoint. A proposal is not a transmission; a hash is not proof of emission; DSN station activity is not a spacecraft-health report. No physical RF or optical emission is performed.

## License

MIT. See [LICENSE](LICENSE) and [Third-Party Notices](THIRD_PARTY_NOTICES.md). External dataset terms remain source-specific.
