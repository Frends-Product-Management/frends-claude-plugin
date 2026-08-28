---
name: build-a-process
description: Build or edit a Frends integration Process as a draft, up to a passing validation. Use when someone wants to create, scaffold, draft or change an integration, or add a trigger or a Task to a Process. Do not use to run a Process, to review a finished draft, or to choose between Process shapes that are still undecided.
---

# Building a Process

Build in a draft, validate it, then stop and hand over.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

For this skill, `validate_process` is the one tool nothing can replace. If the session does not expose it, do not build: an unvalidated draft cannot be called done.

## Fetch the guide first

The server carries its own instructions for this work. Call `get_guide` with `process-authoring` before you create anything and follow it for the mechanics: the four ways `create_process_draft` can start, environment variable lookup, Task parameter groups and modes, reference values, batch operations, layout, and its list of pitfalls. Do not restate that guide from memory; read it in this session. If `get_guide` fails or the guide is not served, call `list_guides`, say what is missing, and build only from what the tool descriptions state.

This skill adds what the guide does not carry: the order to build in, where the work stops, and the checks validation cannot make.

## Read the plan's open questions before you start

When the work comes from a plan, check its open questions first. A question marked as blocking means the Process it blocks cannot be built yet, whatever else the plan contains, and a confirmed plan can still carry one. Build what is not blocked, say which Process is waiting and on whose answer, and do not fill the gap with a guess.

## Plan the build order first

When the plan names several Processes, or the work is large enough that you cannot hold it in one pass, write the build order before you create anything.

A slice is one path from trigger to outcome that ends at a clean `validate_process`. Not a layer: adding every Task, then every connection, then error handling is three passes over the same Process, and nothing is verifiable until the last one. Build the first slice thin, validate, then widen.

Order the slices by what blocks what:

1. Preparation comes first. A Task package that is not installed and an environment variable name that does not exist block everything that uses them.
2. A shared building block other Processes call is always a blocker and never blocked. Build it before its callers.
3. Inside one Process, start with a Manual Trigger and swap in the real trigger as the last slice: add the trigger the integration needs and remove the Manual Trigger in the same slice, because a Process keeps exactly one trigger. A Manual Trigger keeps the Process inert while you build, since nothing starts it by itself. Adding a live trigger early makes an endpoint or a schedule real the moment the Process is deployed, which is why it belongs at the end.
4. Two Processes that do not depend on each other can be built in either order. Slices inside one draft are strictly sequential: one draft is one shape graph, and two sets of changes to it interleave into a mess no tool will untangle.

Every slice is verifiable by validation. A slice is only demonstrable when the user agrees to a run, so never promise a demonstration you need permission to give.

Then show the user the order before building: each slice with its number, what it delivers, and what it waits for. Ask whether the granularity is right, whether the blocking is right, whether anything should be merged or split, and, for each Process, whether it is a brand-new Process or a new version of one that exists. Build after they agree.

Write the order in names and outcomes. A draft id belongs to a draft that promotion consumes, and a deployment id points at a version that moves, so neither survives long enough to be worth writing down.

Changing what a shared building block expects from its callers is the one case where thin slices do not work, because every caller breaks at once. Do it in three stages instead: add the new form beside the old one so nothing breaks, move the callers over one Process at a time, each forked with mode 'edit' so it stays the same Process, and remove the old form only when no caller is left.

## The build loop, and when to stop looping

Each slice is the same loop: change the draft, run `validate_process`, fix what it reports, run it again. After each round, read the draft back with `process_get_structure` and tell the user what was added or changed, rather than building silently.

The loop has a floor. When the same validation error comes back after two different fixes, stop fixing. Report the error text as validation gave it, what you tried, and what you think it means, and ask. Three attempts at one error is the limit; a fourth guess is not more likely to be right than the first.

`process_batch_mutate` is all or nothing: when one operation in a batch fails, the whole batch is rolled back and the draft is as it was. So a failed batch needs no repair, only a corrected batch. Read the error, fix the operation it names, and send the batch again.

## Checks validation cannot make

These pass `validate_process` and still fail at run time or in use. Check them yourself.

**One trigger.** Validation refuses a second Manual Trigger and nothing else, so a draft can carry two live ways to start. Keep the one the plan asked for.

**JSON body without the header.** An HTTP request Task sending JSON needs `Content-Type: application/json` set explicitly. The Task does not add it, and the missing header fails silently at run time while the draft validates.

**Capture before the risky step.** A value the failure path will need must be assigned to a Process variable before the step that can fail runs; on the failure path `#result` no longer holds it.

**An HTTP Process that never answers.** A Process started by an HTTP Trigger must reach an HTTP result shape on every path, including the failure path, or the caller gets nothing back.

## Where you stop

Your work ends at a validated draft. Done means the last `validate_process` call ran after your final change and returned zero errors; report that result, what you built, whether the draft is linked to an existing Process, and where it is.

Safety boundary for build and edit work: the guide's later steps promote the draft, deploy it and activate its trigger. Those are the mechanics for when the user decides to go further, not part of this build. Report the validated draft and what promoting it would do: promotion compiles the draft and deploys the new version to the development Agent Group in one step, and an activated trigger is a live endpoint or schedule. Continue only after the user has read that report and asked for promotion or deployment as a separate decision. The plugin's permission prompt on those tools is a backstop for that conversation, not a replacement for it.

When the draft was built from a plan, offer a review of the draft against that plan before anyone promotes it. Validation proves the draft compiles; it says nothing about whether the draft does what was asked.

Uses (verify against the session's tool list): `get_guide`, `list_guides`, `create_process_draft`, `list_process_drafts`, `process_add_manual_trigger`, `process_add_http_trigger`, `process_add_schedule_trigger`, `process_add_mcp_trigger`, `process_add_task`, `process_add_expression`, `process_add_decision`, `process_add_decision_branch`, `process_add_foreach`, `process_add_while`, `process_add_scope`, `process_add_catch`, `process_add_return`, `process_add_connection`, `process_remove_shape`, `process_edit_shape`, `process_get_structure`, `validate_process`, `list_tasks`, `inspect_task`, `list_environment_variables`. Optional: `process_batch_mutate`.
