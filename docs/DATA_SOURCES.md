# Data Sources and Research Ledger

**Initial baseline review:** 2026-08-05.  
**Revalidation date:** 2026-10-13, for the sources listed in the revalidation ledger below only. The legacy table retains 2026-08-05 as its last review date; not every legacy URL was rechecked in this pass.

| Legacy source | Pattern adopted | URL |
|---|---|---|
| NASA Exoplanet Archive | TAP/API catalog adapter, confirmed-object snapshot | https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html |
| Breakthrough Listen Open Data | Authentic HDF5 products, hashes, target/frequency/date search, `_OFF` controls | https://breakthroughinitiatives.org/opendatasearch |
| UCBerkeleySETI/blimpy | Filterbank/HDF5/GUPPI RAW readers | https://github.com/UCBerkeleySETI/blimpy |
| UCBerkeleySETI/blipss | Periodic-signal search and synthetic-injection pattern | https://github.com/UCBerkeleySETI/blipss |
| SETI Institute FAQ | Narrowband artificiality cue and terrestrial RFI caveat | https://www.seti.org/about/faq |
| SETI post-detection protocols | External verification and responsible disclosure | https://www.seti.org/research/seti-101/protocols-for-an-eti-signal-detection/ |
| LaserSETI | Brief monochromatic optical-flash search | https://www.seti.org/projects/laserseti/ |
| ARRL EME | Moon as passive reflector; approximately 500,000-mile total path | https://www.arrl.org/weak-signal-vhf-dx-meteor-scatter-eme-moonbounce |
| Sónar Calling GJ 273b | Progressive tutorial and low-bitrate interstellar messaging precedent | https://www.sonarcalling.com/en/faq/ |
| ENACOM | Licensed operators, bands, categories and conditions | https://www.enacom.gob.ar/radioaficionados_p127 |
| ITU | Prevent harmful interference | https://www.itu.int/en/ITU-R/terrestrial/tpr/pages/harmfulinterference.aspx |

## Revalidation ledger — 2026-10-13

| Source | Publication / metadata date | Verified finding and limit |
|---|---|---|
| [NASA Voyager mission status](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) | Instrument table says updated 2026-04-17; page metadata says updated 2026-08-20 | Voyager 1 CRS is listed off since 2025-02-25; LECP off since 2026-04-17; MAG and PWS listed on. This is the latest published table, not private engineering telemetry or a live endpoint. |
| [NASA Voyager 2 Big Bang update](https://science.nasa.gov/blogs/voyager/2026/08/04/nasa-engineers-help-prolong-voyager-2s-science-mission/) | 2026-08-04 | NASA reports the power-saving change succeeded on Voyager 2 and says the team plans to perform the same swap on Voyager 1. The sources rechecked on 2026-10-13 did not confirm completion on Voyager 1: `VGR1_BIG_BANG=NOT_CONFIRMED_IN_PUBLIC_SOURCES`. |
| [NASA Voyager 1 light-day milestone](https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/) | NASA's published milestone page, checked 2026-10-13 | NASA gives 2026-11-18 02:16:07 PST and 25,902,068,356 km for the one-light-day milestone. This is a published future milestone, not a live position from Stellar Thread. |
| [NASA PDS PWS VLISM bundle](https://pds.nasa.gov/ds-view/pds/viewBundle.jsp?identifier=urn:nasa:pds:voyager-pws-vlism-density) | Bundle version 2.0; publication year 2026; DOI `10.17189/zkkc-we77` | Bundle metadata gives 2012-10-22T09:44:19.795Z through 2025-09-01T01:29:00.000Z. It is derived electron-density science from PWS characteristic plasma-wave frequencies, not engineering telemetry. |
| [NASA PDS PWS data collection](https://pds.nasa.gov/ds-view/pds/viewCollection.jsp?identifier=urn:nasa:pds:voyager-pws-vlism-density:data) | Collection version 2.0; publication year 2026; parent DOI `10.17189/mm8g-7227` | Collection metadata gives 2012-10-22T09:44:19.795Z through 2025-04-14T05:27:35.917Z. This differs from the parent bundle's stop time. The actual CSV files and last rows were **not downloaded and inspected in this pass**; row-level coverage remains unverified and must be reconciled before importing or plotting it. |
| [NASA PDS September 2026 release summary](https://pds.nasa.gov/datasearch/subscription-service/SS-20260930.shtml) | Announcement 2026-09-30; trajectory package released 2026-09-29 | `Voyager 1 Interplanetary Cruise Trajectory Data` covers 1977-09-09 to 2005-01-24. It is a historical trajectory product, not a current spacecraft position. |
| [NASA DSN Now](https://eyes.nasa.gov/apps/dsn-now/dsn.html) | Checked 2026-10-13 | The page explicitly reports that DSN Now is unavailable during a NASA update. Its documentation says the feed normally uses station data refreshed every five seconds and warns that antenna lock/identification can be misleading in off-nominal conditions. Current state must be `UPSTREAM_UNAVAILABLE`, not `NO_ACTIVE_CONTACT` or spacecraft failure. |
| [JPL Horizons API policy](https://ssd-api.jpl.nasa.gov/) and [manual](https://ssd.jpl.nasa.gov/horizons/manual.html) | Policy review required before production use | Do not call the API from the browser or expose an unbounded public proxy. The current Worker ephemeris path is experimental; upstream policy, caching, request serialization, backoff and operational suitability must be resolved before it is exposed for operational planning. |
| [Canonical repository](https://github.com/simondalmasso/Stellar-thread) | Account/repository identity checked 2026-10-13 | Use `simondalmasso/Stellar-thread` for new links and evidence. Older `simonkey888/Stellar-thread` links may redirect; do not use the old owner as the canonical identity. |

## Authentic Voyager radio-astronomy control

The repository's Voyager 1 control comes from the public Berkeley SETI / Breakthrough Listen radio-astronomy exercise. It is an observation of a known human-made spacecraft's signal recorded from Earth in 2016.

- Source classification: `RECORDED_AUTHENTIC`.
- Scientific role: `HUMAN_TECHNOLOGICAL_CONTROL`.
- `extraterrestrial=false`.
- The HDF5 parent is fetched and hashed by CI; the repository uses a reproducibly derived preview and manifest, not a claim of live telemetry.
- This recording is not the spacecraft's engineering telemetry, health record, or command channel.
- No code from the GPL-3.0 `UCBerkeleySETI/breakthrough` repository is copied into this project. Review data-specific terms before redistributing source data.

## Snapshot and coverage policy

`data/catalog/nearby-stars.json` is the normalized target snapshot; `src/data/nearby-stars.generated.json` is its generated application copy. `npm run catalog:verify` validates their agreement and the catalog's embedded SHA. The refresh script captures raw source responses; it does not silently normalize or overwrite the reviewed application snapshot.

No large Breakthrough Listen HDF5 observation is committed. The repository's checked-in Voyager preview is derived data with a manifest. A missing import or zero verified observation hours means `NO VERIFIED COVERAGE IMPORTED`, not silence in the sky.

All source dates above distinguish publication/metadata coverage from the date on which this review checked the source. A later web crawl or a newly released archive does not make an old dataset current.
