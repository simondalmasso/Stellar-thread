# Deployment

1. Run tests, typecheck and build.
2. Authenticate Wrangler with a scoped Cloudflare API token and account ID stored as secrets.
3. Review `wrangler.jsonc`; `ALLOW_PHYSICAL_TRANSMISSION=false` must remain unchanged.
4. Run `npm run deploy` or the manual GitHub workflow.
5. Verify `/api/v1/health`, static assets, truth labels and mobile layout.

No paid resource is required for the baseline Worker/Assets deployment where the account's free quotas are sufficient. The repository does not create billing resources automatically.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
