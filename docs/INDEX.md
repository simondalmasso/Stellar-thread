# Documentation Index

Use this page as the entry point for technical documentation. Links are relative to this file and target paths present on the product branch.

## Product and architecture

- [Architecture](ARCHITECTURE.md)
- [Product truth and scientific state](PRODUCT_TRUTH.md)
- [Candidate lifecycle](CANDIDATE_LIFECYCLE.md)
- [Cosmic Message Protocol (CMP-1)](COSMIC_MESSAGE_PROTOCOL.md)

## Science, data and provenance

- [Data sources and research ledger](DATA_SOURCES.md)
- [Reality V2 research ledger](RESEARCH_REALITY_V2.md)
- [Target selection](TARGET_SELECTION.md)
- [Normalized nearby-star catalog](../data/catalog/nearby-stars.json)
- [Catalog change report](../data/catalog/change-report.json)
- [Authentic Voyager 1 control manifest](../data/authentic/voyager1-control-manifest.json)
- [Voyager control source preview](../data/authentic/voyager-control-preview.json)
- [Generated preview consumed by the app](../src/data/voyager-control-preview.generated.json)
- [Generated target catalog consumed by the app](../src/data/nearby-stars.generated.json)

## Listening, DSP and RFI

- [SETI pipeline](SETI_PIPELINE.md)
- [RFI rejection](RFI_REJECTION.md)
- [DSP command-line entry point](../listener/cosmic_listener/cli.py)
- [DSP pipeline implementation](../listener/cosmic_listener/pipeline.py)
- [Signal format readers](../listener/cosmic_listener/formats.py)
- [DSP pipeline tests](../listener/tests/test_pipeline.py)
- [Format-reader tests](../listener/tests/test_formats.py)

## Channels and propagation

- [Radio transmission gates](RADIO_TRANSMISSION.md)
- [Optical channel](OPTICAL_CHANNEL.md)
- [EME Moon Relay](EME_MOON_RELAY.md)
- [Target selection and propagation assumptions](TARGET_SELECTION.md)
- [Observatory integration contract](OBSERVATORY_INTEGRATION.md)

## Security, privacy and compliance

- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Regulatory boundaries](REGULATORY.md)

## Operations and delivery

- [Testing](TESTING.md)
- [Operations](OPERATIONS.md)
- [Deployment](DEPLOYMENT.md)
- [Mobile UX and fallback behavior](MOBILE.md)
- [Recovery](RECOVERY.md)

## Third-party and license

- [Third-party notices](../THIRD_PARTY_NOTICES.md)
- [MIT license](../LICENSE)

## Status boundary

The full implementation and this index are on the open product PR branch. They are not part of `main` until that PR is reviewed and merged. No production deployment, live observatory connection, spacecraft command channel, or physical RF/optical transmission is available.
