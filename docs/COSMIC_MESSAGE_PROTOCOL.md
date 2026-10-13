# Cosmic Message Protocol — CMP-1

CMP-1 is an experimental, self-describing frame, not a finalized METI standard.

Layers: acquisition/synchronization; binary definition; prime-number structure; arithmetic; geometry; physical units; time; Solar System position; image format; symbolic language; human payload; reply request.

Implemented frame order:

```text
PREAMBLE d3 a5 c7 f1
VERSION u8
PROFILE u8
REPETITION u8
TARGET_LENGTH u8
EPOCH_SECONDS u64 big-endian
TARGET UTF-8 bytes
PAYLOAD_LENGTH u32 big-endian
PAYLOAD UTF-8 bytes
CRC32 u32 big-endian
FEC repetition-3 over every bit
```

UTF-8 is only the payload representation in this demonstrator. The Universal Language Viewer explicitly shows the preamble, primes, geometry and framing that must precede human text in a facility-grade message. Repetition-3 was chosen for deterministic round-trip and corruption tests; a real link should evaluate Reed–Solomon/LDPC/convolutional coding and interleaving against the facility channel.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
