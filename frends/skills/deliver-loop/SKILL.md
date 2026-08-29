---
name: deliver-loop
description: Run the delivery loop over a confirmed integration plan, building each planned Frends Process to a validated draft with two independent reviews per Process and a handoff at the end. Invoked by name only; a plan whose confirmation status is not confirmed is turned away at the door.
disable-model-invocation: true
---

# The delivery loop

Goal: take a confirmed integration plan to per-Process validated, twice-reviewed drafts and a handoff.

Read the `harness` skill before turn 1 and work under it: the turn shape, the six terminal states, the record grammar, the ask shape and what is never written down all come from there.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## DONE when

- every planned Process in this run has a draft whose last `validate_process` ran after its last change with zero errors, and
- each draft carries two reviewer verdicts, one against Frends conventions and one against the plan, both quoted in full, with no unresolved finding that breaks the plan, and
- the handoff lists per Process the draft, the verdicts, the not-verified items (criteria that need a real run), and the promotion question asked, never taken.

## ANTI-GAMING

A finding is resolved by the builder changing the draft or the person accepting it in their own words into `.frends/decisions.md`, never by this loop deciding it does not matter. Trimming the plan's Process list mid-run to reach DONE is the inversion; a Process that cannot be built ends its slot at blocked and stays in the handoff.

## TERMINAL STATES

Hard cap: 3 build-and-review rounds per Process, 6 Processes per run. A larger plan is split into runs, and saying so is not a failure.

- **success**: DONE above for every Process in the run.
- **clean no-op**: every planned Process already exists as named; list them.
- **blocked**: the plan's confirmation status is not confirmed, a blocking open question is unanswered, or a Process hits a missing name or surviving validation errors; the handoff names each.
- **approval-required**: drafts done, promotion is the person's step; the normal end when the person wants the integration live.
- **exhausted**: a Process used its 3 rounds, or the run its cap; the handoff says what remains.
- **stagnated**: two rounds on one Process with no new evidence.

## SETUP

1. Gate at the door: the plan must carry `confirmation_status: confirmed` and no blocking open question. Anything else is blocked immediately, with the missing piece named.
2. Tell the person once that the run keeps a record under `.frends/`. Create `.frends/runs/deliver-loop-<date>-<nn>.md` with the header (loop, subject, frozen rubric, cap) and write `.frends/current-run` with exactly two lines: `loop: deliver-loop` and `record: runs/deliver-loop-<date>-<nn>.md`.
3. RUBRIC FREEZE: the plan's acceptance criteria per Process plus Part A and Part F of the harness criteria; this run may not edit them.
4. Show the build order with the dependencies and get the person's approval of the order.

## EVERY TURN

One turn is one Process slot moving one round:

1. Observe: read the run record and the slot's state fresh.
2. Act: dispatch `frends:process-builder` with that Process's plan section, criteria and pattern reference.
3. Review twice, independently: `frends:draft-reviewer` with "review this draft snapshot against Frends conventions", then `frends:draft-reviewer` with "review this draft snapshot against this plan section", same snapshot, verdicts quoted in full.
4. Findings go back to the builder verbatim, at most 3 rounds for the Process; a finding the person accepts instead is written into `.frends/decisions.md` in their words.
5. Record: append `turn N · action · evidence · remaining`; reflections on failed verifies as in the harness skill.

The non-interactive form of this loop is the `/frends:deliver-an-integration` workflow; use it when the person wants the fan-out without the per-round conversation.

## At DONE

Write `terminal state: <name>` with one sentence of evidence. Hand off the per-Process table (draft, verdicts, not-verified items), ask the promotion question in the decision shape, and end with open decisions in that shape or the exact line "no open decisions this run". The ledger line is the Stop hook's job.

Uses (verify against the session's tool list): `get_overview`, `validate_process` and the draft tools through the `frends:process-builder` and `frends:draft-reviewer` agents.
