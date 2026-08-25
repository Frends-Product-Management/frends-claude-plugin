---
name: diagnose-failures
description: Investigate failed or slow Process runs in a Frends tenant and explain the cause. Use when someone reports an integration is failing, erroring, stuck, or not producing results, or asks what went wrong with a run.
---

# Diagnosing failed Process runs

This work is read-only. Look, explain, propose. Change nothing.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Find the failing runs

`get_process_instances` lists Process instances in one Agent Group, so you need two things before you can call it.

An Agent Group ID, which comes from `get_overview`. Instances are queried per Agent Group, so if you do not know where the Process runs, check the overview first.

A name filter or a set of Process GUIDs. At least one is required. The filter matches Process names only, not descriptions, so if the user described the integration instead of naming it, find the real name with `list_processes` first.

Then narrow with the state filter to the failed runs and set a time range around the window that matters. Each entry gives the execution ID, the Process name and GUID, the state, start and end timestamps, error information, the trigger name, whether it is a subprocess, and any promoted variable values. Promoted variables are often the fastest clue, because they carry the business identifiers the integration was handling when it stopped.

## Read one failure properly

`get_process_instance_details` takes the Agent Group ID and the execution ID from the previous call. It returns the Process GUID and version, state, timings, duration, Environment, Agent Group and Agent, the trigger parameters, the exception message, plus `HasLoggedSteps` and a `stepDataUri`.

Note what it does not return: a `deploymentId`, and no failing step id. So to look at how the failing Process is built, match by Process GUID against `list_processes` and read it with `get_process_data`. That only finds versions currently deployed. When the failure happened on a version that is no longer deployed, or when `HasLoggedSteps` points at step data you cannot reach, say so and move the user to the Portal rather than inspecting a different version and calling it the same one.

## Name several causes before you test any

Write down three to five possible causes and rank them before you start checking. The first plausible explanation is the one you will find evidence for, because you will go looking for it; naming the alternatives first is what keeps the search honest.

Show the ranked list to the user before you test it. They often know something that re-ranks it in one sentence, such as which system was patched yesterday. Do not wait for them: if they are not there, work your own ranking and say which one you started with.

## Read the evidence as hints, not proof

Some patterns narrow the search, but none of them prove a cause on their own. Treat each as a next thing to check.

Failures that begin right after a deploy make the change the first suspect, so compare the failing version with the previous one. Failures on one Agent while others in the group are fine make that Agent and its surroundings worth checking before the Process logic. A single failed run among many successes points at that run's data first. Failures at regular intervals suggest a schedule or a rate limit. In every one of these, bad data, a dependency being down, configuration and the Process itself can all produce the same shape, so confirm before concluding.

## What to hand back

Say what failed, when it started, how many runs are affected, and the narrowest cause the evidence actually supports. Where the evidence runs out, say that. A named uncertainty is more useful than a confident guess, because the user can go and check it.

Then propose the next step and let the user take it. Retrying a run, editing a Process, changing an environment variable and deploying a new version are all the user's decisions. Deleting a Process, undeploying and deactivating are Portal work these tools do not offer, so name what should be cleaned up and leave the cleanup to the user.

Uses (verify against the session's tool list): `get_overview`, `get_process_instances`, `get_process_instance_details`, `list_processes`, `get_process_data`, `process_get_structure`, `process_get_shape_config`.
