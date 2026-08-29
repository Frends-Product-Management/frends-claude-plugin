---
name: fix-loop
description: Run a bounded fix loop for a Frends Process that is failing in an Environment, from diagnosis through the person's chosen cause to a validated edit draft, with a run record under .frends/ and a named terminal state. Use when a deployed Process fails and the person wants the fix built, not only explained. Do not use to build a new integration, which is the build loop, or when only the explanation is wanted, which is the diagnose-failures skill.
---

# The fix loop

Goal: take a failing deployed Process to a validated edit draft that addresses the cause the person chose.

Read the `harness` skill before turn 1 and work under it: the turn shape, the six terminal states, the record grammar, the ask shape and what is never written down all come from there.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## DONE when

- the person chose the cause from the ranked diagnosis, and
- an edit draft of the same Process (never a new one) carries the frozen change statement, and
- the last `validate_process` ran after the last change with zero errors, and the `frends:draft-reviewer` verdict, quoted in full, finds the change matches the statement and the preserved behavior is untouched.

Proving the fix needs a promotion and a run, which are the person's steps. The normal end of this loop is therefore approval-required, and saying so is part of DONE.

## ANTI-GAMING

A cause is not confirmed because the fix for it validates; validation proves compilation, not the diagnosis. Editing the frozen change statement to match what was built is the inversion this loop exists to prevent. Never widen the edit past the statement because the draft was open anyway.

## TERMINAL STATES

Hard cap: 8 turns.

- **success**: not reachable here; a fix that validates ends at approval-required by design.
- **clean no-op**: the failing runs predate a version that already fixed the cause; name the version.
- **blocked**: the Process or its failing runs cannot be found, the connection fails, or the run evidence cannot reproduce the symptom after three distinct readings; that reading is itself the finding, report it.
- **approval-required**: the validated edit draft is ready; promoting it and proving the fix with a run are the person's decisions, asked in the decision shape.
- **exhausted**: the hard cap was reached; say what remains.
- **stagnated**: the same validation error twice in a row, or two turns with no new evidence.

## SETUP

1. Confirm the target Process exists and has failing runs; none found is clean no-op or blocked, said honestly.
2. Tell the person once that the run keeps a record under `.frends/`. Create `.frends/runs/fix-loop-<date>-<nn>.md` with the header (loop, subject, frozen rubric, cap) and write `.frends/current-run` with exactly two lines: `loop: fix-loop` and `record: runs/fix-loop-<date>-<nn>.md`.
3. Diagnose: dispatch `frends:failure-diagnoser` for ranked causes with run evidence; when the session cannot run agents, follow the diagnose-failures skill inline.
4. The person picks the cause. Present the ranked causes in the decision shape, recommendation first, one question.
5. RUBRIC FREEZE: freeze the change statement, "change <shape> so that <symptom> stops", plus the behavior that must stay as it is, plus Part A and Part F of the harness criteria. Write them into the record header; this run may not edit them.

## EVERY TURN

1. Observe: read the run record and the draft state fresh.
2. Choose the single most valuable in-scope action; read the last reflection first.
3. Act: dispatch `frends:process-builder` with the change statement and the frozen criteria; the draft is always `create_process_draft` in edit mode on the target Process, never a new Process. Inline fallback as in the harness skill, with the review owed and named.
4. Verify: zero errors after the last change, then `frends:draft-reviewer` with the neutral brief "review this edit against these lenses: the change statement, the preserved behavior, Frends conventions", verdict quoted in full.
5. Record: append `turn N · action · evidence · remaining`; after a failed verify also `reflection: <why> → <what changes next turn>`.

Repeat or stop under the two-tier stop.

## At DONE

Write `terminal state: <name>` with one sentence of evidence. Ask the promote-and-prove question in the decision shape, and end with open decisions in that shape or the exact line "no open decisions this run". The ledger line is the Stop hook's job.

Uses (verify against the session's tool list): `get_overview`, `get_process_instances`, `get_process_instance_details`, `create_process_draft`, `validate_process` through the `frends:failure-diagnoser`, `frends:process-builder` and `frends:draft-reviewer` agents.
