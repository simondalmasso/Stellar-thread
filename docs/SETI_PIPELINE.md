# SETI Pipeline

```text
INGEST → VALIDATION → CALIBRATION → CHANNELIZATION/STFT
→ ROBUST NOISE → COHERENT DECHIRP SEARCH → PERIODICITY
→ BURST SEARCH → RFI ON/OFF → MULTI-STATION COINCIDENCE
→ CANDIDATE → HUMAN REVIEW
```

`cosmic-listener` implements deterministic primitives and records source hash, configuration summary, version, station, target, frequency, bandwidth, drift, SNR, periodicity, burst score and RFI tests. It does not use an AI score as proof.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
