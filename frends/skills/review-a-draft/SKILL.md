---
name: review-a-draft
description: Read a built Frends Process draft and report what is wrong with it, against the plan it came from and against Frends conventions, before anyone promotes it. Use when a draft is finished and someone asks whether it is right or complete, or wants it checked before promoting. Do not use to build or change a draft, to promote one, or to investigate a Process that is already failing in an Environment.
---

# Reviewing a Process draft

A draft that validates is a draft that compiles. It can still move the wrong fields, miss half of what was asked for, or carry a mistake that only appears when it runs. This skill reads a finished draft and reports what is wrong with it. It changes nothing.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Pin the draft before anything else

Find the draft with `list_process_drafts` and run `validate_process` on it once, here. A draft that does not validate is not ready for review: hand it back for building, because the errors validation reports are the work that comes first.

Then take one snapshot and read only from it. For a draft: `process_get_structure` for the shapes and their connections, then `process_get_shape_config` for every shape it lists, once each. For a deployed Process the shape tools do not apply, because they read drafts only: the snapshot is the definition `get_process_data` returns for the `deploymentId`, and the review says it worked from the definition rather than the shape tools. Do not create a draft to review a deployment unless the user asks for that in so many words; a fork is build work, and it leaves a draft in the tenant that they will have to discard. Every finding below reads from the snapshot, so both axes see the same Process even if it changes while the review runs.

## Fetch the conventions from the server

Call `get_guide` with `process-authoring`. Its parameter rules, reference-value table and pitfall list are the conventions the draft is read against; the plugin does not keep a second copy of them. If `get_guide` fails, call `list_guides`, say that the conventions axis is reduced to the plugin's own checks, and continue.

## Find the plan

Look for the plan in the conversation first, then in a path the user gave you, then in a plan whose integration name matches the draft. If there is no plan, say so and review conventions only; a review with no plan is half a review and the user should know which half they are getting.

If the plan's `confirmation_status` is still `pending`, that is a finding in itself: the draft was built against something nobody approved.

## Review on two axes, and keep them apart

Work the two axes separately and report them separately. Never merge the findings and never rank one list against the other. When this session can run subagents, hand the same snapshot, the same guide text and the plan to the `draft-reviewer` agent twice, one brief per axis, and report what each returns under its own heading. The brief is neutral: "review this snapshot against these lenses", never "confirm it is fine", because a brief that says what to find pre-writes the verdict. Each verdict comes back under `## Findings: <axis>` with a `## Not verified` section and a closing `Count:` line; quote it in full rather than summarising it. When the session cannot run subagents, do both readings yourself, one after the other, in the same shape.

### Axis one: Frends conventions

Skip anything `validate_process` already catches. It ran clean when you pinned the draft, so everything here is a fault validation cannot see. Each is a judgement call, not a rule: name what you see, say what would fix it, and let the user decide.

First apply the guide: read each pitfall in its list and each row of its reference-value table against the snapshot, and report what the draft breaks, quoting the guide line. Then the checks the guide does not carry:

- **A trigger the plan did not ask for.** A second Manual Trigger is refused when it is added, but other combinations are not, so a draft can carry a live way to start that nobody planned. Keep the triggers the plan names.
- **JSON body without the header.** An HTTP request Task sending JSON with no explicit `Content-Type: application/json`. It fails at run time and validates cleanly.
- **Value lost before the failure.** A value the failure path needs that was never assigned to a Process variable before the risky step ran.
- **HTTP Process with no answer.** A Process started by an HTTP Trigger with a path that never reaches an HTTP result shape. The caller gets nothing back.
- **Undefined "changed since the last run".** A scheduled Process with no definition of what counts as changed, or no answer for what happens when a run takes longer than its interval.
- **Thin MCP surface.** An MCP Trigger whose tool name or description would not tell a calling AI client what the tool does. That text is all the caller ever sees.
- **Classifier on an optional field.** A decision branching on a field that not every incoming record carries.
- **Credential in a value.** A secret written into a parameter instead of referenced from an environment variable. Report it as a fault and never quote the value: write the reference, not the secret.
- **Shape that carries no weight.** A branch, retry or loop nothing in the plan asked for. Every shape should break something if you removed it.

Error handling is judged against the plan's failure section, not against a fixed rule. A call with no scope and catch around it is a finding when the plan says the run must survive that failure, and not a finding when the plan says the run should stop and report.

### Axis two: the plan

Report three things, and quote the plan line or the handoff key behind every one of them, so the user can check the finding against the plan without trusting your reading of it.

- **Missing or partial.** Something the plan asked for that the draft does not do, or does halfway.
- **More than was asked.** A shape doing something the plan put out of scope, a Process that is not in the plan's process list, a trigger of a different type than the plan named, or a Task doing work the plan gave to a different Process. Worst of this kind: the work was already promoted or deployed. Promotion consumes the draft, so you meet this as a draft that has left the draft list and a version that exists without anyone approving it. Promotion is a deployment and it belongs to the user, so if it has already happened, lead with that.
- **There but wrong.** A field mapped to the wrong target, a transformation the mapping table does not describe, an error policy that does something other than what the plan's failure section says.

## Say what the reading cannot reach

This review reads a draft. It does not run one, so anything that only shows up in a run is outside what the reading can settle: whether the other system accepts what is sent, whether a mapping produces the value someone expects, whether a run finishes inside its window.

List those separately as not verified, and name what would settle each one. The plan's acceptance criteria are the source: any criterion that needs a run goes on this list rather than being treated as met. A review with no findings means nothing was found in what could be read, never that the draft is proven to work.

## Report

Give the two axes their own headings and leave them separate, and keep the not-verified list with them. End with the count of findings on each axis, the worst one on each, and the count of acceptance criteria a run would still have to settle. Do not pick an overall winner: that ranking is exactly what keeping the axes apart is meant to prevent.

The two axes catch different failures, and either can pass while the other fails. A draft can be perfectly idiomatic Frends and sync the wrong fields. A draft can carry out the plan exactly and send JSON without its header, so it fails the first time it runs. A clean validation makes both feel finished, which is why the reading is split in two.

## Where you stop

You report. You do not fix the draft, and you do not promote it. Hand the findings back so the building work can carry on from them, and let the user decide what to change.

Uses (verify against the session's tool list): `get_guide`, `list_guides`, `list_process_drafts`, `validate_process`, `process_get_structure`, `process_get_shape_config`, `inspect_task`, `get_process_data`.
