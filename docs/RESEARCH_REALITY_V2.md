# Research ledger — Reality V2

**Initial baseline review:** 2026-08-05. **Revalidated subset:** 2026-10-13. This ledger records patterns, boundaries and licensing decisions; it is not a claim that every referenced project is integrated. The new date applies only to the source findings listed in the revalidation section; the older rows below were not all rechecked on 2026-10-13.

| Source | Pattern adopted | Boundary / license decision |
|---|---|---|
| Apple HIG — layout, materials, motion, tab bars, sidebars | Content-first hierarchy, system typography, limited translucent navigation, meaningful motion, 44 px targets | Principles reimplemented; no Apple assets, trade dress or proprietary UI copied. |
| NASA DSN Now / Deep Space Network | Show station/link/light-time as evidence-backed operational state | Presentation pattern only; no DSN access or affiliation claimed. |
| Gaia Sky / OpenSpace / WorldWide Telescope | Separate physical scale from narrative navigation; catalog-backed objects | No source code copied. Procedural particles are atmosphere only. |
| Lightyear.fm | Narrative continuity between distance and time | Inspiration only; never used as a scientific source; narrative view says NOT TO SCALE. |
| Astropy SkyCoord.apply_space_motion | Epoch-aware host aim-point estimation and explicit uncertainty | Reality V2 uses a small linear proper-motion implementation; Astropy is the validation/reference path for facility planning. BSD-3-Clause compatible. |
| JPL Horizons API | Reproducible lunar range/range-rate/light-time plan with raw snapshot hash | Experimental adapter only. Do not expose as operational planning or public proxy until JPL policy, serialization, cache and backoff constraints are verified. |
| NASA Exoplanet Archive TAP | Exact-query, timestamped, hashed catalog refresh with last-valid fallback | Public catalog attribution retained. |
| Breakthrough Listen public data / Berkeley Voyager exercise | Authentic human technological control, parent hash, derived slice, replay manifest | Public data is fetched during CI; never relabeled synthetic or extraterrestrial. |
| blimpy / turboSETI | HDF5/filterbank ingestion and drift-search comparison | blimpy BSD-3-Clause; turboSETI MIT. Patterns adopted; no incompatible code copied. |
| BLIPSS | Periodicity and injection/recovery testing | MIT pattern reimplemented in the local DSP pipeline. |
| FAST multibeam SETI work | Multibeam coincidence as RFI veto | Scientific pattern only; no FAST data or affiliation claimed. |
| Technosearch | Coverage bibliography/provenance links | Link/index integration only when stable; zero records means NO VERIFIED COVERAGE IMPORTED. |

## Revalidation ledger — 2026-10-13

- [NASA Voyager mission status](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) lists Voyager 1's CRS off since 2025-02-25, LECP off since 2026-04-17, and MAG/PWS on. The instrument table identifies 2026-04-17 as its status update date; this is published status, not a live engineering feed.
- [NASA's 2026-08-04 Voyager 2 update](https://science.nasa.gov/blogs/voyager/2026/08/04/nasa-engineers-help-prolong-voyager-2s-science-mission/) confirms the Big Bang power-saving change succeeded on Voyager 2 and says the same change is planned for Voyager 1. The sources checked for this review did not confirm completion on Voyager 1.
- [NASA's light-day milestone](https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/) states a milestone of 2026-11-18 02:16:07 PST at 25,902,068,356 km. Do not treat it as a live position supplied by this app.
- [NASA PDS PWS VLISM bundle](https://pds.nasa.gov/ds-view/pds/viewBundle.jsp?identifier=urn:nasa:pds:voyager-pws-vlism-density), DOI `10.17189/zkkc-we77`, lists coverage through 2025-09-01. Its [data collection](https://pds.nasa.gov/ds-view/pds/viewCollection.jsp?identifier=urn:nasa:pds:voyager-pws-vlism-density:data) lists a stop time of 2025-04-14. Actual CSV rows were not inspected in this pass; row-level coverage must be reconciled before import.
- [NASA PDS's 2026-09-30 release summary](https://pds.nasa.gov/datasearch/subscription-service/SS-20260930.shtml) lists Voyager 1 Interplanetary Cruise Trajectory Data released 2026-09-29, with historical coverage ending 2005-01-24. It is not a current-position feed.
- [NASA DSN Now](https://eyes.nasa.gov/apps/dsn-now/dsn.html) currently shows a maintenance/unavailable notice. Use `UPSTREAM_UNAVAILABLE`, not `NO_ACTIVE_CONTACT`, while the source is unavailable. NASA also warns that off-nominal antenna lock can misidentify a spacecraft.
- Canonical repository URL checked on 2026-10-13: https://github.com/simondalmasso/Stellar-thread. New links should use `simondalmasso/Stellar-thread`; legacy `simonkey888/Stellar-thread` URLs may redirect.

This research refresh does not establish a live observatory connection, private Voyager engineering telemetry, or a spacecraft command channel. No code from the GPL-3.0 `UCBerkeleySETI/breakthrough` repository is copied into this project.
