---
name: diagnose-failures
description: Investigate failed, stuck or slow runs of a deployed Frends Process and explain the cause, read-only. Use when someone reports that an integration is failing, erroring, stuck or not producing results, or asks what went wrong with a run. Do not use for a connection that does not work at all, such as missing tools, 401 or 404, which is setup, and do not use to change anything.
---

# Diagnosing failed Process runs

This work is read-only. Look, explain, propose. Change nothing.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Fetch the guide first

Call `get_guide` with `diagnose-process` and follow it for the mechanics: which tool finds the runs, how the Agent Group id is resolved, what one execution's details contain, the failure patterns it knows and what usually fixes each. If `get_guide` fails, call `list_guides`, say what is missing, and work from the tool descriptions.

## What this skill adds

**Name several causes before you test any.** Write down three to five possible causes and rank them before you start checking. The first plausible explanation is the one you will find evidence for, because you will go looking for it. Show the ranked list to the user before you test it: they often know something that re-ranks it in one sentence, such as which system was patched yesterday. Do not wait for them; if they are not there, work your own ranking and say which one you started with.

**Say what the reading cannot reach.** The execution details do not name a `deploymentId` or a failing step, so the Process you read with `get_process_data` is the version deployed now. When the failure happened on a version that is no longer deployed, or the step data is out of reach, say so and move the user to the Portal rather than inspecting a different version and calling it the same one.

**Hand back a narrow claim.** Say what failed, when it started, how many runs are affected, and the narrowest cause the evidence supports. Where the evidence runs out, say that; a named uncertainty is more useful than a confident guess, because the user can go and check it.

**The next step is the user's.** Retrying a run, editing a Process, changing an environment variable and deploying a new version are their decisions. When they want the fix built rather than only explained, offer the `/frends:fix-loop` skill: it takes the chosen cause to a validated edit draft with a run record and an independent review. Deleting a Process, undeploying and deactivating are Portal work these tools do not offer, so name what should be cleaned up and leave it to them.

Uses (verify against the session's tool list): `get_guide`, `list_guides`, `get_overview`, `get_process_instances`, `get_process_instance_details`, `list_processes`, `get_process_data`, `list_environment_variables`.
