---
name: build-a-process
description: Build or edit a Frends integration Process as a draft, up to a passing validation. Use when someone wants to create, scaffold, draft or change an integration, add a trigger or a Task to a Process, run a Process for a test, or check that a draft compiles.
---

# Building a Process

Build in a draft, validate it, then stop and hand over.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

For this skill, `validate_process` is the one tool nothing can replace. If the session does not expose it, do not build: an unvalidated draft cannot be called done.

## Decide what you are creating first

`create_process_draft` behaves in four different ways, and the choice decides whether you are changing an existing Process or making a new one. The name you give it does not decide that. Get this right before you build anything.

With no source inputs you get an empty scaffold, which promotes later as a brand-new Process. With a `deploymentId` and mode 'edit' the draft stays linked to that Process, so promoting it creates a **new version of that existing Process**. With a `deploymentId` and mode 'new' you get an unlinked copy that promotes as a separate Process and leaves the deployment alone. Duplicating an existing draft by `draftId` is also unlinked.

Forking from a deployment only works when that deployment is the Process's latest version, which is the version deployed in the Development Environment.

Keep the `draftId` you get back. Every later call needs it.

## Plan the build order first

When the plan names several Processes, or the work is large enough that you cannot hold it in one pass, write the build order before you create anything.

A slice is one path from trigger to outcome that ends at a clean `validate_process`. Not a layer: adding every Task, then every connection, then error handling is three passes over the same Process, and nothing is verifiable until the last one. Build the first slice thin, validate, then widen.

Order the slices by what blocks what:

1. Preparation comes first. A Task package that is not installed and an environment variable name that does not exist block everything that uses them.
2. A shared building block other Processes call is always a blocker and never blocked. Build it before its callers.
3. Inside one Process, start with a Manual Trigger and swap in the real trigger as the last slice: add the trigger the integration needs and remove the Manual Trigger in the same slice, because a Process keeps exactly one trigger. A Manual Trigger keeps the Process inert while you build, since nothing starts it by itself, and it is the only trigger a person can start on demand after the Process is deployed. Adding a live trigger early makes an endpoint or a schedule real the moment the Process is deployed, which is why it belongs at the end.
4. Two Processes that do not depend on each other can be built in either order. Slices inside one draft are strictly sequential: one draft is one shape graph, and two sets of changes to it interleave into a mess no tool will untangle.

Every slice is verifiable by validation. A slice is only demonstrable when the user agrees to a run, so never promise a demonstration you need permission to give.

Then show the user the order before building: each slice with its number, what it delivers, and what it waits for. Ask whether the granularity is right, whether the blocking is right, whether anything should be merged or split, and, for each Process, whether it is a brand-new Process or a new version of one that exists. Build after they agree.

Write the order in names and outcomes. A draft id belongs to a draft that promotion consumes, and a deployment id points at a version that moves, so neither survives long enough to be worth writing down.

Changing what a shared building block expects from its callers is the one case where thin slices do not work, because every caller breaks at once. Do it in three stages instead: add the new form beside the old one so nothing breaks, move the callers over one Process at a time, each forked with mode 'edit' so it stays the same Process, and remove the old form only when no caller is left.

## The sequence

1. Add exactly one trigger. `process_add_manual_trigger` while you are still testing, or the trigger the integration really needs, such as `process_add_http_trigger`, `process_add_schedule_trigger` or `process_add_mcp_trigger`.
2. Add the steps. `process_add_task` places a Task, `process_add_expression` holds a small piece of logic, `process_add_decision` with `process_add_decision_branch` branches, and `process_add_foreach` or `process_add_while` loops.
3. Connect the shapes with `process_add_connection`. A shape that is not connected does not run.
4. Handle errors on purpose. `process_add_scope` with `process_add_catch` contains a failure instead of letting it end the whole run.
5. Run `validate_process` on the draft. Fix what it reports, then run it again, until it comes back clean.

Build in slices, not all at once: after the trigger and the first happy-path step, validate, then widen. A draft that grew shape by shape with validation between rounds is easy to fix; a draft built blind and validated once at the end is not.

After each round of changes, read the draft back with `process_get_structure` and tell the user what was added or changed, rather than building silently.

## Configure Tasks from the template, not from memory

Find Tasks with `list_tasks`, then call `inspect_task`. It returns a `ParametersTemplate`: every group and field present, with the correct mode and a safe default already filled in. Pass that to `process_add_task` unchanged and override only the values you actually need. Do not invent field names.

Follow the mode the template shows for each field. A fixed value goes in as text; a value built from `#var` or `#trigger` references goes in as a C# expression; never wrap either in code fences. Some fields take a bare `#reference` expression while template and content fields interpolate with `{{ #reference }}`, and the template shows which is which.

When an HTTP request Task sends a JSON body, set the `Content-Type: application/json` header explicitly. The Task does not add it, and the missing header fails silently at run time while the draft still validates.

If the draft then fails to validate or compile, call `inspect_task` again with `includeFullSchema: true` to get field descriptions, constraints and array shapes.

Use `process_edit_shape` to correct a shape rather than removing and re-adding it, and `process_batch_mutate` to apply several changes in one call.

## Expressions and reference values

`process_add_expression` holds one pure C# expression: no statements, no semicolons, no `return`. A step that only performs a side effect must not produce a value, and a value a later step needs must be assigned to a Process variable.

An HTTP call's response comes back as Body, Headers and StatusCode; read fields as `#result.Body["fieldName"]`. Manual Trigger parameters are read as `#trigger.data.<name>`.

To use an earlier step's output after a decision, loop or scope, capture it in a Process variable first. A named `#result[Shape]` reference into a branch cannot be relied on.

On a catch path `#result` is empty. Read the failure through `#var.error`, and capture any value you will need after a risky step into a Process variable before that step runs.

## Things that surprise people

**One trigger, not two.** A draft with two triggers can look acceptable and still not behave the way you meant.

**A draft is built with tools, not BPMN text.** `create_process_draft` starts from a scaffold or a fork, never from supplied BPMN, so build the shape sequence with the `process_add_*` tools.

**Validate before promoting.** A draft can be saved in a state that does not compile, and `validate_process` is the check that tells you. It is cheap, so run it often. Judge the draft by `validate_process`, not by the Portal editor's red marks, which are as-you-type hints rather than validation results.

**Promoting consumes the draft.** Once a draft becomes a Process version it is no longer waiting in the draft list, so do not plan to keep editing the same `draftId` afterwards.

**Promoting an unlinked draft never updates an existing Process.** Even at the same name it creates a new Process with a new GUID, so fork with `deploymentId` and mode 'edit' when the user means to change an existing Process.

## Running and deploying are the user's decisions

`start_process` starts only Processes whose trigger is a Manual Trigger, and Manual Trigger parameter defaults are not applied on the server, so supply a value for every declared parameter. Running a deployed Process does real work in a real Environment: ask the user before every run, and never run one to satisfy your own curiosity.

Promoting is itself a deployment. `create_process_from_draft` validates and compiles the draft, then immediately deploys the new version to the development Agent Group. That is one gate, not two, and it belongs to the user.

`deploy_process` activates HTTP endpoints, schedules and event triggers by default (`activateTriggers` defaults to true). Pass `activateTriggers: false` unless the user explicitly asked to go live, and say which triggers went live in the result report.

## Where you stop

Your work ends at a validated draft. Done means the last `validate_process` call ran after your final change and returned zero errors; report that result, what you built, whether the draft is linked to an existing Process, and where it is. Say what you would do next, and let the user choose.

When the draft was built from a plan, offer a review of the draft against that plan before anyone promotes it. Validation proves the draft compiles; it says nothing about whether the draft does what was asked.

Uses (verify against the session's tool list): `create_process_draft`, `list_process_drafts`, `process_add_manual_trigger`, `process_add_http_trigger`, `process_add_schedule_trigger`, `process_add_mcp_trigger`, `process_add_task`, `process_add_expression`, `process_add_decision`, `process_add_decision_branch`, `process_add_foreach`, `process_add_while`, `process_add_scope`, `process_add_catch`, `process_add_connection`, `process_edit_shape`, `process_get_structure`, `validate_process`, `list_tasks`, `inspect_task`, `start_process`, `create_process_from_draft`, `deploy_process`. Optional: `process_batch_mutate`.
