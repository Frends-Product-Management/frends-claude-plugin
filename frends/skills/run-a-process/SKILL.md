---
name: run-a-process
description: Run, start, trigger or test a deployed Frends Process, only on the person's explicit confirmation. Use when someone asks to run, execute, kick off, fire or test a Process, or to try out a draft they just built. Do not use to build or edit a draft, to review one, or to investigate a run that already failed.
---

# Running a Process

A run does real work in a real Environment. The decision to run is the user's, every time.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Fetch the guide first

Call `get_guide` with `execute-process` and follow it: it carries the checks before a run, the confirmation block the user answers, the parameter rules and the polling limits. Do not run without the confirmation it describes. If `get_guide` fails, call `list_guides`, say what is missing, and do not start anything until the user has confirmed the Process, the Environment, the parameters and the side effects in writing.

## What this skill adds

**A draft cannot run.** Only a deployed Process starts. If the user wants to try a draft, say that trying it means promoting it, which compiles the draft and deploys the new version to the development Agent Group, and that promoting is a separate decision for them to make. Do not promote in order to test.

**Testing has side effects too.** A test run writes the same rows and sends the same messages as a real one. Before the confirmation block, name the data the run will touch, whether it is safe test data or live records, who reverses the effect if the result is wrong, and that the parameters go into the tenant's audit log. A run whose effects nobody can reverse deserves a pause, not a faster confirmation.

**The plugin's permission prompt is a backstop.** The person may also be asked by their client before the run starts. That prompt does not replace the confirmation in the conversation; both have to happen.

**After the run, report what happened, then stop.** A failed run is a diagnosis question, and a run that needs a change to the Process is build work. Hand over rather than fixing and re-running on your own.

Uses (verify against the session's tool list): `get_guide`, `list_guides`, `list_processes`, `start_process`, `get_process_instance_details`, `get_process_instances`.
