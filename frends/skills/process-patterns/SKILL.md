---
name: process-patterns
description: Choose the right shape for a Frends integration Process before building it, and say which shapes go where. Use when the requirements are known but the structure is not, when someone asks what kind of Process fits a need, or wants to compare approaches before any building starts. Do not use when the shape is already chosen, when someone asks to build or edit a draft, or when the requirements themselves are still open.
---

# Choosing a Process shape

This skill is for the moment before building: the need is known, the shape is not. If the user already knows what to build, or asks to build or edit a draft, skip this and build. Pick one shape, say why in one or two sentences, and hand over to building.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

Each shape below names the trigger tool it needs. A shape whose trigger tool this session does not expose can still be built in the Portal, so recommend it honestly and say that the build has to happen there.

## Where the shape knowledge comes from

The shapes and the rules below were read out of 24 real Processes exported from one Frends tenant, with every customer, system and credential detail removed. A rule that says how often something appeared gives that count as its evidence and its limit; a rule without a count describes what the Processes of that kind in the sample did, and nothing more. 24 Processes from one tenant are a sample, not the platform. These are common shapes, not a list of everything a Process can be. When a need fits none of them, say so and design from the trigger outwards.

## The common shapes

Each shape has its own reference file with the ordered shapes, the error-handling that was seen in real Processes of that kind, and the usual mistakes. Read the reference for the shape you recommend before describing it to the user, and read two when the choice is close.

**API endpoint.** Something calls in and waits for an answer. An HTTP Trigger starts the Process, steps do the work, and the Process answers through an HTTP result shape carrying the status code, content type and content. Needs `process_add_http_trigger`. Reference: `references/api-endpoint.md`.

**MCP tool.** An AI client calls the Process as a tool. An MCP Trigger carries the tool name and its input schema, the steps read the arguments, call the system, reshape the answer, and return JSON. Needs `process_add_mcp_trigger`. Reference: `references/mcp-tool.md`.

**Scheduled sync.** Nothing calls in; the Process wakes up, reads what changed, and acts. A Schedule Trigger starts it. Needs `process_add_schedule_trigger`. Reference: `references/scheduled-sync.md`.

**Event-driven routing.** Things arrive one at a time and different kinds need different handling. A trigger fires per arriving event, a decision classifies it, and branches fan out per kind. Needs the matching trigger tool, such as `process_add_queue_trigger`, plus `process_add_decision` and `process_add_decision_branch`. Reference: `references/event-driven-routing.md`.

**File transform.** A file appears, gets parsed, transformed, and sent onward, sometimes with a wait for the other side to answer. Needs `process_add_file_watch_trigger`. Reference: `references/file-transform.md`.

**Task chain.** A short utility: a person starts it, a few Tasks and expressions run in order, and it returns a result. Needs `process_add_manual_trigger`. Reference: `references/task-chain.md`.

## Rules that held across every shape

- The smallest Process that does work is a trigger, one activity and a Return shape. Start there and widen.
- A Process may have several triggers of different kinds feeding the same first shape, and at most one Manual Trigger; validation refuses a second Manual Trigger.
- A promoted result, the value monitoring shows for a run, was set on Return and Code shapes and nowhere else in the sample. Set it there when the user asks for one.
- Retry on a Task was set on one Task in the whole sample. The references say what the sample did instead for each kind; whether a retry setting fits is the plan's call.
- The field mode rules in the served process-authoring guide are where the sample's most frequent build mistake sits. Read that table before configuring a Task, not after validation passes; a wrong mode validates and fails at run time.

## Choosing between them

Two questions settle most cases. What starts a run: a caller waiting for an answer means an API endpoint or an MCP tool; time means a scheduled sync; an arriving thing means event-driven routing or a file transform; a person means a Task chain. And does anything wait for the result: if yes, the shape must answer; if no, the shape must report somewhere instead.

One integration need may take several Processes: a shared building block other integrations call is its own Process, and parts that start from different triggers or schedules are separate Processes.

When the shape is chosen, hand over to building: create the draft, build it slice by slice, and stop at a passing validation.

Uses (verify against the session's tool list): `process_add_http_trigger`, `process_add_mcp_trigger`, `process_add_schedule_trigger`, `process_add_queue_trigger`, `process_add_file_watch_trigger`, `process_add_manual_trigger`, `process_add_decision`, `process_add_decision_branch`.
