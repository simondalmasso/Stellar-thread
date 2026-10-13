# Observatory Integration

Accepted adapter families: SigMF, complex NPY, SIGPROC Filterbank, HDF5 and GUPPI RAW. Direct local support covers SigMF `cf32_le` and NPY. Installing `cosmic-listener[authentic]` enables the `blimpy` adapter for Breakthrough Listen formats.

A live adapter must publish heartbeat, station ID/location, pointing, on/off-source state, frequency, bandwidth, sample rate, calibration and UTC clock quality. Missing or stale heartbeat removes the LIVE label.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
