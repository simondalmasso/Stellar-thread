# Product truth — Reality V2

A draft, encoding or proposal is not a transmission. `IN_FLIGHT` can only be derived from a persisted `TRANSMITTED_PROOFED` record with valid UTC timestamp, payload SHA-256, proof artifact SHA-256, public station/operator identity and authorization references. The tracker recomputes distance from the persisted timestamp and the SI speed of light; animation ticks never alter scientific state.

The packet glyph is a visual metaphor. Physical wavefront geometry is spherical only for explicitly isotropic emission, a directional cone/cap when beam width is known, and a line of sight plus uncertainty when it is not. Narrative mode is always marked `NOT TO SCALE`.

## Voyager: three separate truth classes

1. **Recorded radio-astronomy observation (2016):** the Berkeley SETI / Breakthrough Listen Voyager control is a terrestrial observation of a known human-made spacecraft's radio signal. It is `RECORDED_AUTHENTIC`, `HUMAN_TECHNOLOGICAL_CONTROL`, and `extraterrestrial=false`. Its derived waterfall is `DERIVED`. It is not spacecraft engineering telemetry.
2. **PWS VLISM electron-density series:** a derived science product based on Plasma Wave Science characteristic frequencies. PDS metadata gives different stop times for the bundle and data collection; the actual CSV rows must be inspected before fixing the effective coverage. It is neither live data nor engineering telemetry.
3. **Published mission status:** only the latest status NASA/JPL publicly documents. The NASA instrument table checked on 2026-10-13 lists Voyager 1 CRS and LECP off, MAG and PWS on, and other historical instrument states. NASA's 2026-08-04 article confirms the Big Bang power-saving change on Voyager 2 and describes Voyager 1 as planned; completion on Voyager 1 was not confirmed in the sources rechecked for this review.

`COMMAND_CHANNEL=NOT_AVAILABLE`, `PUBLIC_ENGINEERING_TELEMETRY=NOT_CONNECTED`, and `NASA_MISSION_CONTROL=EXTERNAL_AUTHORITY`. DSN Now unavailability is `UPSTREAM_UNAVAILABLE`, not proof of no contact or spacecraft failure. A station contact does not establish instrument health.

## Deployment truth

D1 schema and local Worker integration are tested with the local binding in `wrangler.local.jsonc`. The production configuration `wrangler.jsonc` currently has no D1 binding, and no production database has been provisioned or migrated. Do not claim production persistence or deployment.

A hash proves byte integrity, not the truth of what those bytes describe. Zero imported coverage is `NO VERIFIED COVERAGE IMPORTED`, not cosmic silence.
