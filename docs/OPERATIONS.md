# Operations

Health: `GET /api/v1/health`. A healthy API can still have zero observatories and zero authentic candidates; those states must remain explicit. Persistence-dependent routes require the `DB` binding. The local/CI binding in `wrangler.local.jsonc` does not prove production persistence; `wrangler.jsonc` currently has no D1 binding.

For incident handling: stop any deployment, preserve input hashes/manifests, export candidate records, compare the deployed SHA and roll back to the previous Worker version. Do not call a route operationally available merely because a local CI test passed.

## External-source outages and freshness

- A failed or maintenance-mode NASA DSN Now source is `UPSTREAM_UNAVAILABLE`, not `NO_ACTIVE_CONTACT` and not spacecraft failure.
- Do not infer spacecraft health or instrument state from DSN antenna activity.
- The last published NASA instrument table is dated 2026-04-17; keep publication/effective date separate from the date the source was checked.
- Voyager PWS VLISM is a derived archive. Its bundle and data-collection metadata disagree on the stop date; do not import or chart it as current until the actual CSV rows and labels are inspected and hashed.
- The target catalog is a checked-in versioned snapshot. Run `npm run catalog:verify` to validate the normalized/generated relationship; refresh captures raw responses but requires reviewed normalization before replacing the snapshot.
- The Moon Relay's mean-distance result is educational. The experimental JPL Horizons path is not approved for operational planning until policy, rate/cache behavior and failure handling are verified. Do not create a public upstream request proxy.

Physical RF remains a separate owner/facility gate and must not be toggled as an incident workaround. No spacecraft command channel, live observatory, or private engineering telemetry is connected.
