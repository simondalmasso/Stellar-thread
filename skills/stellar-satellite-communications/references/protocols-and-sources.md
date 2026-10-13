# Protocols and authoritative sources

## Source hierarchy

Prefer, in order:

1. Current official standards, regulations, mission operations documentation, and primary data repositories.
2. Official agency technical papers and validated ground-station documentation.
3. Peer-reviewed literature and reproducible research repositories.
4. Secondary summaries only for discovery, then verify material claims against primary sources.

For a consequential claim, seek two independent sources where feasible. If sources disagree, report the disagreement and lower confidence; do not average incompatible definitions.

## Standards and regulatory references

- [Agent Skills specification](https://agentskills.io/specification) — portable skill metadata and folder conventions.
- [CCSDS publications](https://ccsds.org/publications/) and [CCSDS Blue Books](https://ccsds.org/publications/bluebooks/) — space data systems and communication standards, including telecommand, telemetry, space data links, and security.
- [ITU Radio Regulations](https://www.itu.int/pub/R-REG-RR/en) — international radio-spectrum framework. Check the current edition and applicable national implementation.
- National spectrum regulators and facility owners — use the current official source for the actual jurisdiction and mission.

A standards reference explains a protocol; it does not authorize an operation. Do not invent command words, spacecraft command sequences, frequencies, encryption keys, or operational timing from partial documentation.

## Scientific and mission data

- [NASA/JPL HORIZONS](https://ssd.jpl.nasa.gov/horizons/) — ephemeris and solar-system geometry. Its output is a model or ephemeris result, not a satellite control interface.
- [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) — exoplanet catalog data. Preserve query parameters, retrieval time, and catalog version where available.
- [ESA Gaia archive](https://gea.esac.esa.int/archive/) — astrometry and catalog data. Record release, source identifiers, units, and epoch.
- [SatNOGS Network](https://network.satnogs.org/) and [SatNOGS documentation](https://wiki.satnogs.org/) — public station and observation context. Public visibility does not imply permission to control equipment or access non-public data.
- [NASA Technical Reports Server](https://ntrs.nasa.gov/) — mission and engineering publications.
- [SETI Institute](https://www.seti.org/) and public research datasets — use published, reproducible data and distinguish recorded observations from live reception.

## Provenance record

For each imported dataset or external result, capture as many of the following as are available:

- Canonical source URL, publisher, and data owner.
- Retrieval timestamp in UTC and request/query parameters.
- Dataset release, mission revision, protocol edition, or catalog epoch.
- Object, station, instrument, and coordinate-frame identifiers.
- Units, time scale, transformations, filters, and software version.
- SHA-256 or equivalent integrity hash for immutable artifacts.
- License, reuse constraints, freshness, known gaps, and source limitations.

Do not label data “live” unless the source explicitly supports live access and the retrieval path has been verified. Do not label a recorded human spacecraft signal as extraterrestrial.
