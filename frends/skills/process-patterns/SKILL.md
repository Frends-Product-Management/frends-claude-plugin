---
name: process-patterns
description: Choose the right shape for a Frends integration Process before building it. Use when someone is unsure how to structure an integration, asks what kind of Process fits a need, or wants to compare approaches before any building starts. Do not use when the shape is already chosen or when someone asks to build or edit a draft.
---

# Choosing a Process shape

This skill is for the moment before building: the need is known, the shape is not. If the user already knows what to build, or asks to build or edit a draft, skip this and build. Pick one shape, say why in one or two sentences, and hand over to building.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

Each shape below names the trigger tool it needs. A shape whose trigger tool this session does not expose can still be built in the Portal, so recommend it honestly and say that the build has to happen there.

## The common shapes

These are common shapes, not a list of everything a Process can be. When a need fits none of them, say so and design from the trigger outwards.

**API endpoint.** Something calls in and waits for an answer. An HTTP Trigger starts the Process, steps do the work, and the Process answers through an HTTP result shape carrying the status code, content type and content. A Process started this way should always answer with an HTTP result; Processes started by hand or on a schedule return a plain result instead. Needs `process_add_http_trigger`. The usual mistake: forgetting the response shape, so the caller gets nothing useful back.

**MCP tool.** An AI client calls the Process as a tool. An MCP Trigger carries the tool name and its input schema, the steps read the arguments, call the system, reshape the answer, and return JSON. Keep it thin: one tool, one job. Needs `process_add_mcp_trigger`. The usual mistake: a vague tool name and description, which is all the calling AI client ever sees.

**Scheduled sync.** Nothing calls in; the Process wakes up, reads what changed, and acts. A Schedule Trigger starts it, the first steps work out what "changed since last run" means, then the rest act on those records. Needs `process_add_schedule_trigger`. The usual mistake: leaving "changed since last run" undefined, and runs that overlap when one takes longer than the interval.

**Event-driven routing.** Things arrive one at a time and different kinds need different handling. A trigger fires per arriving event (a queue message, a file, an incoming call), a decision classifies it, and branches fan out per kind. Needs the matching trigger tool, such as `process_add_queue_trigger`, plus `process_add_decision` and `process_add_decision_branch`. The usual mistake: classifying on a field that not every event carries.

**File transform.** A file appears, gets parsed, transformed, and sent onward. A file watch trigger starts the Process when the file arrives; steps parse it, reshape the content, and deliver it. Needs `process_add_file_watch_trigger`. The usual mistakes: no rule for what happens to a file once handled, and no path for a file that fails halfway.

**Task chain.** A short utility: a person starts it, a few Tasks and expressions run in order, and it returns a result. A Manual Trigger, two to five steps, one connection line through them. Needs `process_add_manual_trigger`. The usual mistake: growing a quick chain into a real integration without ever revisiting the trigger or the error handling.

## Choosing between them

Two questions settle most cases. What starts a run: a caller waiting for an answer means an API endpoint or an MCP tool; time means a scheduled sync; an arriving thing means event-driven routing or a file transform; a person means a Task chain. And does anything wait for the result: if yes, the shape must answer; if no, the shape must report somewhere instead.

One integration need may take several Processes: a shared building block other integrations call is its own Process, and parts that start from different triggers or schedules are separate Processes.

When the shape is chosen, hand over to building: create the draft, build it slice by slice, and stop at a passing validation.

Uses (verify against the session's tool list): `process_add_http_trigger`, `process_add_mcp_trigger`, `process_add_schedule_trigger`, `process_add_queue_trigger`, `process_add_file_watch_trigger`, `process_add_manual_trigger`, `process_add_decision`, `process_add_decision_branch`.
