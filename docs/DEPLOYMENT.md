# Deployment

## Current verified state

No production deployment has been executed. `wrangler.jsonc` is the production configuration and currently has no `d1_databases` entry or `DB` binding. `wrangler.local.jsonc` defines a local D1 binding used for local development and CI tests only.

The Worker requires D1 for persistence-dependent routes. Without `DB`, these routes return `503 D1 persistence unavailable`; a successful local D1 test is not evidence of production persistence. A production deployment must not be described as persistent until a real D1 resource, binding, and authorized migration procedure are explicitly configured and verified.

## Controlled deployment procedure

1. Run catalog verification, tests, typecheck, secret scan, license inventory and build on the exact proposed SHA.
2. Obtain explicit owner approval and use a scoped Cloudflare API token and account ID stored as protected secrets. Do not add credentials to source, frontend, logs, or artifacts.
3. Review `wrangler.jsonc`. Add a real D1 binding only after the database is explicitly authorized/provisioned; preserve `ALLOW_PHYSICAL_TRANSMISSION=false`.
4. Review the deploy preflight against the actual production configuration; do not assume it detects an absent D1 binding unless the test proves that.
5. Do not run remote D1 migrations until separately authorized.
6. If deployment is later approved, verify the deployed source SHA, environment, D1 binding, health response, static assets, truth labels and mobile layout.

No paid resource is required for a Worker/Assets-only baseline where account quotas allow it, but that baseline is not a persistent D1 service. The repository does not create billing resources automatically.

## Safety boundary

Deployment does not authorize physical transmission. No transmitter-control endpoint is exposed, and `ALLOW_PHYSICAL_TRANSMISSION=false` must remain unchanged.

## Estado de verdad

This document distinguishes official data, derived estimates, authentic recorded observations, synthetic fixtures, human review, stale data and unavailable data. No peak, score or coincidence is presented as an extraterrestrial message.
