# Deployment

## Free public deployment

`.github/workflows/deploy-free.yml` publishes the application to the existing Cloudflare Worker after CI succeeds on `main`. It uses the repository secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`; it does not need an operator token or a D1 database ID. The Worker is configured to run first for `/api/*`, so SPA fallback cannot mask API JSON responses. Preview URLs are disabled.

This connected Cloudflare account already has 10 D1 databases. The Workers Free limit is 10 databases per account, so this workflow does not create a database, delete another project's database, or upgrade the account. It deploys in `STATIC_READ_ONLY` mode:
- The catalog, scientific visualizations and recorded Voyager control preview are available.
- Health and build provenance endpoints remain available.
- D1-backed message persistence and write APIs are disabled; the UI must not claim a message was persisted.
- JPL Horizons ephemeris requests are disabled in this mode to avoid unauthenticated upstream calls.
- `ALLOW_PHYSICAL_TRANSMISSION=false` is enforced by the generated configuration.

This is a real public web deployment, but it is not a persistent messaging service. To enable D1-backed persistence while staying at $0, an unused D1 slot must first be freed by the account owner or a separate free-tier account must be explicitly configured. This repository will not delete or reuse another project's database automatically.

## D1-backed deployment

`.github/workflows/deploy.yml` remains a separate, manually triggered path. It requires `OPERATOR_API_TOKEN` and `STELLAR_THREAD_D1_DATABASE_ID` in addition to the Cloudflare credentials. Do not run it until an authorized D1 database exists and the production migration plan has been reviewed. It must preserve `ALLOW_PHYSICAL_TRANSMISSION=false`.

## Verification

The free deployment workflow verifies:
1. The deployed homepage and build endpoint respond.
2. The deployed source SHA matches the CI-tested `main` commit.
3. The Worker reports `STATIC_READ_ONLY`, no D1 binding and physical transmission disabled.
4. The threads API remains unavailable without D1 and ephemeris requests are blocked in static mode.

## Safety boundary

Deployment does not authorize physical transmission. No transmitter-control endpoint is enabled. Public, imported, recorded and synthetic data remain separately labelled; no score or coincidence is presented as an extraterrestrial message.
