# Data Sources and Research Ledger

Accessed 2026-08-05.

| Source | Pattern adopted | URL |
|---|---|---|
| NASA Exoplanet Archive | TAP/API catalog adapter, confirmed-object snapshot | https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html |
| Breakthrough Listen Open Data | authentic HDF5 products, hashes, target/frequency/date search, `_OFF` controls | https://breakthroughinitiatives.org/opendatasearch |
| UCBerkeleySETI/blimpy | Filterbank/HDF5/GUPPI RAW readers | https://github.com/UCBerkeleySETI/blimpy |
| UCBerkeleySETI/blipss | periodic-signal search and synthetic injection pattern | https://github.com/UCBerkeleySETI/blipss |
| SETI Institute FAQ | narrowband artificiality cue and terrestrial RFI caveat | https://www.seti.org/about/faq |
| SETI post-detection protocols | external verification and responsible disclosure | https://www.seti.org/research/seti-101/protocols-for-an-eti-signal-detection/ |
| LaserSETI | brief monochromatic optical-flash search | https://www.seti.org/projects/laserseti/ |
| ARRL EME | Moon as passive reflector; approximately 500,000-mile total path | https://www.arrl.org/weak-signal-vhf-dx-meteor-scatter-eme-moonbounce |
| Sónar Calling GJ 273b | progressive tutorial, binary FSK-like pulses, 62.5–500 bit/s | https://www.sonarcalling.com/en/faq/ |
| ENACOM | licensed operators, bands, categories and conditions | https://www.enacom.gob.ar/radioaficionados_p127 |
| ITU | prevent harmful interference | https://www.itu.int/en/ITU-R/terrestrial/tpr/pages/harmfulinterference.aspx |

No large Breakthrough Listen observation is committed. The archive notes that files can be several gigabytes. The repository ships metadata adapters and deterministic fixtures; authentic processing begins only when a user imports an exact file plus hash.

## Estado de verdad

Este documento distingue datos oficiales, derivados, observaciones auténticas grabadas, pruebas sintéticas, revisión humana y datos no disponibles. Ningún pico, score o coincidencia se presenta como mensaje extraterrestre.
