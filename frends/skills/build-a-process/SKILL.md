---
name: build-a-process
description: Build or edit a Frends integration Process as a draft, up to a passing validation. Use when someone wants to create, scaffold, draft or change an integration, add a trigger or a Task to a Process, or check that a draft compiles.
---

# Building a Process

Build in a draft, validate it, then stop and hand over.

## Decide what you are creating first

`create_process_draft` behaves in three different ways, and the choice decides whether you are changing an existing Process or making a new one. The name you give it does not decide that. Get this right before you build anything.

With no source inputs you get an empty scaffold, which promotes later as a brand-new Process. With a `deploymentId` and mode 'edit' the draft stays linked to that Process, so promoting it publishes a **new version of that existing Process**. With a `deploymentId` and mode 'new' you get an unlinked copy that promotes as a separate Process. Duplicating an existing draft by `draftId` is also unlinked.

Forking from a deployment only works when that deployment is the Process's latest version, which is the version deployed in the Development Environment.

Keep the `draftId` you get back. Every later call needs it.

## The sequence

1. Add exactly one trigger. `process_add_manual_trigger` while you are still testing, or the trigger the integration really needs, such as `process_add_http_trigger`, `process_add_schedule_trigger` or `process_add_mcp_trigger`.
2. Add the steps. `process_add_task` places a Task, `process_add_expression` holds a small piece of logic, `process_add_decision` with `process_add_decision_branch` branches, and `process_add_foreach` or `process_add_while` loops.
3. Connect the shapes with `process_add_connection`. A shape that is not connected does not run.
4. Handle errors on purpose. `process_add_scope` with `process_add_catch` contains a failure instead of letting it end the whole run.
5. Run `validate_process` on the draft. Fix what it reports, then run it again, until it comes back clean.

## Configure Tasks from the template, not from memory

Find Tasks with `list_tasks`, then call `inspect_task`. It returns a `ParametersTemplate`: every group and field present, with the correct mode and a safe default already filled in. Pass that to `process_add_task` unchanged and override only the values you actually need. Do not invent field names.

If the draft then fails to validate or compile, call `inspect_task` again with `includeFullSchema: true` to get field descriptions, constraints and array shapes.

Use `process_get_structure` to see what you have really built, `process_edit_shape` to correct a shape rather than removing and re-adding it, and `process_batch_mutate` to apply several changes in one call.

## Things that surprise people

**One trigger, not two.** A draft with two triggers can look acceptable and still not behave the way you meant.

**Validate before promoting.** A draft can be saved in a state that does not compile, and `validate_process` is the check that tells you. It is cheap, so run it often.

**Promoting consumes the draft.** Once a draft becomes a Process version it is no longer waiting in the draft list, so do not plan to keep editing the same `draftId` afterwards.

## Where you stop

Your work ends at a validated draft. Report what you built, that validation passed, whether the draft is linked to an existing Process, and where it is.

Promoting the draft to a Process version and deploying it to an Agent Group are the user's decisions. Running a deployed Process is possible from here, but it does real work in a real Environment, so ask first and never run one to satisfy your own curiosity. Say what you would do next, and let the user choose.

Works with: `create_process_draft`, `list_process_drafts`, `process_add_manual_trigger`, `process_add_http_trigger`, `process_add_schedule_trigger`, `process_add_mcp_trigger`, `process_add_task`, `process_add_expression`, `process_add_decision`, `process_add_decision_branch`, `process_add_foreach`, `process_add_while`, `process_add_scope`, `process_add_catch`, `process_add_connection`, `process_edit_shape`, `process_batch_mutate`, `process_get_structure`, `validate_process`, `list_tasks`, `inspect_task`.
