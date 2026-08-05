# Arquitectura

```text
PUBLIC_WEB (React/Vite/Three.js)
    ↕ HTTPS JSON/SSE
Cloudflare Worker API
    ├── target/thread/message services
    ├── truth/provenance serialization
    ├── transmission proposal export (no TX)
    └── static assets

OBSERVATORY_INGEST (adapter contract)
    ↕ SigMF / NPY / Filterbank / HDF5 / GUPPI RAW
cosmic-listener (Python DSP)
    ├── validation + provenance
    ├── STFT/channelization
    ├── drift/periodicity/burst searches
    ├── RFI on/off-source
    └── multi-station coincidence
```

Boundaries: `PUBLIC_WEB`, `OBSERVATORY_INGEST`, `OPERATOR_CONSOLE` and `TRANSMISSION_EXPORT` are separate concepts. The public Worker has no transmitter-control endpoint. Persistent ledgers can be added through D1/KV after explicit resource authorization; this zero-cost baseline is stateless.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
