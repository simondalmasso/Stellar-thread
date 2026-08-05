# Security

Threat boundaries: untrusted imports, oversized files, malformed frames, SSE clients, operator authorization and supply chain. The Worker validates JSON with Zod, caps message lengths, has no public transmitter endpoint and sets no secrets in source. Import processing should remain isolated with file-size/time/memory limits.

Deployment credentials belong only in Cloudflare/GitHub secrets. CI runs a repository secret-pattern scan. This scan is not a substitute for GitHub secret scanning or a dedicated scanner.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
