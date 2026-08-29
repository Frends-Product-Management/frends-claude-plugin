---
name: harness
description: The working rules every frends loop and loop agent runs under, what done means, the six ways a run ends, who reviews whom, what gets recorded, and what never gets written down. Read at the start of every loop and preloaded into the plugin's agents. Not a task in itself and changes nothing in a tenant.
---

# How a frends loop works

A loop turn is Observe, Choose, Act, Verify, Record, then repeat or stop. Read the current state fresh, pick the single most valuable in-scope action, make one bounded change (a batch sent as one call counts as one change), verify it against the same check every time, write the record line, then continue or enter a named terminal state. For a draft, Verify means `validate_process` and nothing else; reading the structure back is Observe, not Verify.

## Done is observable

Done is a `validate_process` result, a reviewer's verdict, a finite checklist with every item marked, or the person's word. A draft that exists is not done. A validation you remember running is not done; the record must show it after the last change. If you cannot point at the evidence, you are not done.

## The six ways a run ends

Every run ends in exactly one of these, written in the last message as `terminal state: <name>` with one sentence of evidence:

- **success**: done, as the loop defines it.
- **clean no-op**: the request was already met before any change; name what meets it.
- **blocked**: a named fact, tool or answer is missing; the record says which and whose.
- **approval-required**: the next step is the person's decision; the record names it.
- **exhausted**: the hard cap was reached; the record says what remains.
- **stagnated**: no progress under the stop rule; the record carries the last reflection.

Never dress a failure up as success. A draft with one error left is exhausted or stagnated. A step that needs the person is approval-required, and "success, with open questions" is approval-required too.

## Two ways to stop

A hard cap the loop states as a number, and a no-progress rule: two verification passes in a row that changed nothing, or two reflections in a row that say the same thing. Whichever comes first ends the run. Never spend a turn to avoid writing exhausted or stagnated.

## The maker is not the reviewer

The one who built the draft does not judge it. The reviewer gets a neutral brief: the criteria, the snapshot, the served guide text, and no summary from the maker of what was built or how good it is. A brief that says "confirm it works" pre-writes the verdict and voids it; the shape is "review this against these lenses". The verdict is quoted in full into the conversation and the run record, never summarised. The maker never edits the criteria, the plan or the brief that gate it; a criterion that turns out wrong is the person's change to make, not the loop's.

## Ask when blocked, one question at a time

A decision that blocks progress is raised when it arises, never batched to the end and never silently defaulted. The shape: the situation in two sentences; two or three real options, each with what it gives and what it costs; your recommendation first; one question. Every run ends either with its open decisions in this shape or with the explicit line "no open decisions this run". Ending with neither fails the loop's own contract.

## Record every turn

One line per turn in the open run record under `.frends/runs/`: `turn N · action · evidence · remaining`. Evidence names a tool and its result, such as `validate_process draft 7: 0 errors`, never an adjective. After a failed verify, add `reflection: <why> → <what changes next turn>` and read the last reflection before choosing the next action. The stop rule reads this record, not your memory, and the record is what survives compaction: after a resume, read it before acting. The ledger line at the end of a run is written by the plugin's Stop hook, not by you.

## When the same failure appears twice

Stop fixing the output and name the fault in the process: the wrong guide, the wrong order, a missing fact. Write it into the record before the next attempt.

## What a gate proves

The plugin's hooks check presence and order: that a validation followed the last change, that a verdict has its required parts. GATE RESULT ONLY, presence and order, not evidence of quality. A gate can fail work; only a reviewer and the person can pass it. This plugin ships no second-model judge; at convergence the reviewer verdict stands and the absent judge is named in the closing summary, never silently skipped. When the session cannot run agents at all, the review is owed and named, never replaced by the maker grading its own work.

## What is never written down

No token, no environment-variable value, no parameter value, no credential-shaped string, in a record, a verdict, a brief or a message. Write the name or the reference in its place.

## The boundary that never moves

Promoting a draft, deploying a version, starting a run, importing a Task package and creating an environment variable are the person's decisions, asked for in the question shape above and never taken inside a loop.

The loop criteria a reviewer scores a run against are in `references/CRITERIA.md` in this skill's directory.
