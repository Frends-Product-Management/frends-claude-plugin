---
name: review-a-draft
description: Review a built Frends Process draft against the plan it came from and against Frends conventions, before anyone promotes it. Use when a draft is finished and someone asks whether it is right, complete, or ready to promote. Do not use to build or change a draft, to promote one, or to investigate a Process that is already failing in an Environment.
---

# Reviewing a Process draft

A draft that validates is a draft that compiles. It can still move the wrong fields, miss half of what was asked for, or carry a mistake that only appears when it runs. This skill reads a finished draft and reports what is wrong with it. It changes nothing.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Pin the draft before anything else

Find the draft with `list_process_drafts` and run `validate_process` on it once, here. A draft that does not validate is not ready for review: hand it back for building, because the errors validation reports are the work that comes first. Reviewing an invalid draft spends the whole review on findings the builder would have seen anyway.

To review a Process that is already deployed, fork it into a draft first: `create_process_draft` with the `deploymentId` and mode 'new' makes an unlinked copy that leaves the deployment alone. Tell the user the fork exists so they can discard it in the Portal afterwards.

Then read the draft once: `process_get_structure` for the shapes and their connections, `process_get_shape_config` for the configuration of each shape that matters. Work from that reading rather than fetching the same shape twice.

## Find the plan

Look for the plan in the conversation first, then in a path the user gave you, then in a plan whose integration name matches the draft. If there is no plan, say so and review conventions only; a review with no plan is half a review and the user should know which half they are getting.

If the plan's `confirmation_status` is still `pending`, that is a finding in itself: the draft was built against something nobody approved.

## Review on two axes, and keep them apart

Work the two axes separately and report them separately. Never merge the findings and never rank one list against the other.

### Axis one: Frends conventions

Skip anything `validate_process` already catches. It ran clean when you pinned the draft, so everything here is a fault validation cannot see. Each of these is a judgement call, not a rule: name what you see, say what would fix it, and let the user decide.

- **Orphan shape.** A shape with nothing connecting into or out of it. It does not run; connect it or remove it.
- **Two triggers.** More than one trigger on one draft. Keep the one the plan asked for.
- **JSON body without the header.** An HTTP request Task sending JSON with no explicit `Content-Type: application/json`. It fails at run time and validates cleanly.
- **Invented parameter.** A Task field that is not in what `inspect_task` returns as the template. Take the template again and override only what the plan needs.
- **Result read across a boundary.** A named `#result[Shape]` reference reaching into a decision, loop or scope. Capture the value into a Process variable instead.
- **Result read on a catch path.** `#result` is empty there; read the failure through `#var.error`.
- **Value lost before the failure.** A value the catch path needs that was never captured into a Process variable before the risky step ran.
- **Statement in an expression shape.** Semicolons, a `return`, or several statements where one pure C# expression belongs.
- **HTTP Process with no answer.** A Process started by an HTTP Trigger that never reaches an HTTP result shape. The caller gets nothing back.
- **Undefined "changed since the last run".** A scheduled Process with no definition of what counts as changed, or no answer for what happens when a run takes longer than its interval.
- **Thin MCP surface.** An MCP Trigger whose tool name or description would not tell a calling AI client what the tool does. That text is all the caller ever sees.
- **Classifier on an optional field.** A decision branching on a field that not every incoming record carries.
- **Uncontained external call.** A call to another system with no scope and catch around it, so one failure ends the whole run.
- **Credential in a value.** A secret written into a parameter instead of referenced from an environment variable. Report it as a fault and never quote the value: write the reference, not the secret.
- **Shape that carries no weight.** A branch, retry or loop nothing in the plan asked for. Every shape should break something if you removed it.

### Axis two: the plan

Report three things, and quote the plan line or the handoff key behind every one of them, so the user can check the finding against the plan without trusting your reading of it.

- **Missing or partial.** Something the plan asked for that the draft does not do, or does halfway.
- **More than was asked.** A shape doing something the plan put out of scope, a Process that is not in the plan's process list, a trigger of a different type than the plan named, or a Task doing work the plan gave to a different Process. Worst of this kind: the draft was already promoted or deployed. Promotion is a deployment and it belongs to the user, so if it has already happened, lead with that.
- **There but wrong.** A field mapped to the wrong target, a transformation the mapping table does not describe, an error policy that does something other than what section 6 says.

## Report

Give the two axes their own headings and leave them separate. End with the count of findings on each axis and the worst one on each. Do not pick an overall winner: that ranking is exactly what keeping the axes apart is meant to prevent.

The two axes catch different failures, and either can pass while the other fails. A draft can be perfectly idiomatic Frends and sync the wrong fields. A draft can carry out the plan exactly and read a result across a branch boundary, so it breaks the first time that branch is taken. A clean validation makes both feel finished, which is why the reading is split in two.

## Where you stop

You report. You do not fix the draft, and you do not promote it. Hand the findings back so the building work can carry on from them, and let the user decide what to change.

Uses (verify against the session's tool list): `list_process_drafts`, `validate_process`, `process_get_structure`, `process_get_shape_config`, `inspect_task`, `create_process_draft`.
