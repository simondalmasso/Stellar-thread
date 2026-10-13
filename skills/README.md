# Agent Skills in Stellar Thread

This repository uses the portable [Agent Skills format](https://agentskills.io/specification).

## Installed skill

- `stellar-satellite-communications` — safe research, analysis, simulation, and planning for satellite communications, spacecraft telemetry, radio astronomy, and hypothetical SETI signals.

## Discovery and use

The skill lives at `skills/stellar-satellite-communications/SKILL.md` with supporting files in its `references/` directory. Point an Agent Skills-compatible client at that folder or install/copy the folder using that client's documented skill mechanism.

Not every agent runtime discovers repository skills automatically. The root `AGENTS.md` file points coding agents at the skill for relevant tasks, but other clients may need explicit configuration. Do not claim universal automatic discovery.

## Safety model

The skill defaults to read-only observation, analysis, simulation, and non-executing planning. It does not grant access to satellite systems, authorize RF/optical transmission, or replace facility, operator, regulatory, or equipment-owner approval.
