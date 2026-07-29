---
name: diagnose-failures
description: Investigate failed or slow Process runs in a Frends tenant and explain the cause. Use when someone reports an integration is failing, erroring, stuck, or not producing results, or asks what went wrong with a run.
---

# Diagnosing failed Process runs

This work is read-only. Look, explain, propose. Change nothing.

## Find the failing runs

`get_process_instances` lists execution instances of Processes in an Agent Group. It needs at least one of a name filter or a set of Process GUIDs, so start from the Process the user named, or from `list_processes` when you only have a description to work from. Then filter by execution state to the failures and narrow the time range to the window that matters.

Each entry gives the execution id, the Process name and GUID, the state, start and end timestamps, error information, the trigger name, whether it is a subprocess, and any promoted variable values. Promoted variables are often the fastest clue, because they carry the business identifiers the integration was handling when it stopped.

## Read one failure properly

`get_process_instance_details` returns the full record for a single execution: version, state, timings, duration, Environment, Agent Group and Agent. Two of those fields do more work than the rest.

Which version ran. A failure that began right after a deploy points at the change, not at the data.

Which Agent ran it. Failures on one Agent in a group while the others are fine point at that Agent or its surroundings, not at the Process logic.

## Correlate to the Process

Once you know where a run stopped, read how that step is built. `get_process_data` with the deployment id gives the model. To walk the shape tree, fork the Process to a draft and use `process_get_structure`, then `process_get_shape_config` for the step itself. Match the failing step to its real configuration before forming an opinion.

## Separate the incident from the pattern

One failure and a thousand failures need different answers, so count them and look at the timestamps. A single failed run is usually the data. Every run failing since a point in time is usually a change or a dependency that is down. Failures at regular intervals suggest a schedule or a rate limit.

## What to hand back

Say what failed, when it started, how many runs are affected, and the narrowest cause the evidence actually supports. Where the evidence runs out, say that. A named uncertainty is more useful than a confident guess, because the user can go and check it.

Then propose the next step and let the user take it. Retrying a run, editing a Process, changing an environment variable and deploying a new version are all decisions for the user in the Portal. Do not make them on their behalf.

Works with: `get_process_instances`, `get_process_instance_details`, `list_processes`, `get_process_data`, `process_get_structure`, `process_get_shape_config`.
