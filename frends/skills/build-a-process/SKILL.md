---
name: build-a-process
description: Build or edit a Frends integration Process as a draft, up to a passing validation. Use when someone wants to create, scaffold, draft or change an integration, add a trigger or a Task to a Process, or check that a draft compiles.
---

# Building a Process

Build in a draft, validate it, then stop. Promoting and deploying are the user's decisions.

## The sequence

1. `create_process_draft` with no source inputs creates an empty scaffold to build on. Keep the draft id it returns, because every later call needs it.
2. Add exactly one trigger. Use `process_add_manual_trigger` while you are still testing, or the trigger the integration really needs, such as `process_add_http_trigger`, `process_add_schedule_trigger` or `process_add_mcp_trigger`.
3. Add the steps. `process_add_task` places a Task, `process_add_expression` holds a small piece of logic, `process_add_decision` with `process_add_decision_branch` branches, and `process_add_foreach` or `process_add_while` loops. Read a Task's parameters with `inspect_task` before configuring it, rather than guessing field names.
4. Connect the shapes with `process_add_connection`. A shape that is not connected does not run.
5. Handle errors on purpose. `process_add_scope` with `process_add_catch` contains a failure instead of letting it end the whole run.
6. Run `validate_process` on the draft. Fix what it reports, then run it again, until it comes back clean.

Use `process_get_structure` to see what you have actually built rather than what you think you built. Use `process_edit_shape` to correct a shape instead of removing and re-adding it, and `process_batch_mutate` to apply several changes in one call.

## Things that surprise people

**One trigger, not two.** A draft with two triggers can look acceptable and still not behave the way you meant. Decide the trigger and add it once.

**Validate before promoting.** A draft can be saved in a state that does not compile. `validate_process` is the check that tells you, and it is cheap to run often.

**Promoting consumes the draft.** Once a draft becomes a Process version it is no longer waiting in the draft list, so do not plan to keep editing the same draft id afterwards.

**A new name means a new Process.** Creating something under a different name gives you a separate Process, not a new version of the existing one.

## Where you stop

Your work ends at a validated draft. Report what you built, that validation passed, and where the draft is, then hand it over.

Promoting the draft to a Process version, deploying it to an Agent Group, and running it against real data are the user's decisions and are made in the Portal. Say clearly what you would do next, and let them do it.

Works with: `create_process_draft`, `list_process_drafts`, `process_add_manual_trigger`, `process_add_http_trigger`, `process_add_schedule_trigger`, `process_add_mcp_trigger`, `process_add_task`, `process_add_expression`, `process_add_decision`, `process_add_decision_branch`, `process_add_foreach`, `process_add_while`, `process_add_scope`, `process_add_catch`, `process_add_connection`, `process_edit_shape`, `process_batch_mutate`, `process_get_structure`, `validate_process`, `list_tasks`, `inspect_task`.
