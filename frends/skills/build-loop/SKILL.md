---
name: build-loop
description: Run a bounded build loop that takes an integration request or a confirmed plan to a validated Frends Process draft, with a run record under .frends/, an independent review before success, and a named terminal state. Use when a plan carries acceptance criteria, when several build-and-validate rounds are expected, or when someone asks for the build loop. Do not use for a one-shape edit, to run or promote anything, or to fix a Process already failing in an Environment, which is the fix loop.
---

# The build loop

Goal: take the request or the confirmed plan to a validated draft that meets the frozen criteria.

Read the `harness` skill before turn 1 and work under it: the turn shape, the six terminal states, the record grammar, the ask shape and what is never written down all come from there.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## DONE when

- the last `validate_process` on the draft ran after the last change and reported zero errors, and
- the `frends:draft-reviewer` verdict, quoted in full, lists no finding that breaks a frozen criterion, and
- every frozen criterion is met with evidence or reported to the person as an open item.

## ANTI-GAMING

Deleting or weakening a frozen criterion is not meeting it. A validation remembered from before the last change is not a validation. A reviewer brief that says what to confirm voids the verdict. Never patch the draft by hand past the builder to make a finding disappear; send the finding back through the builder.

## TERMINAL STATES

Hard cap: 8 turns, because a draft that needs more than eight build-and-review rounds needs a smaller plan, not more turns.

- **success**: DONE above, reviewer verdict quoted.
- **clean no-op**: an existing Process or draft already meets the request; name it.
- **blocked**: the connection or authorization fails, a Task package or an environment variable is missing (report the name, never invent it), or validation errors survive the builder's own fix cap; quote what is missing.
- **approval-required**: promoting, deploying or starting is the next step. Permanent for those steps: promotion compiles the draft, deploys it to the development Agent Group and consumes the draft. Ask in the decision shape; never take it.
- **exhausted**: the hard cap was reached; say what remains.
- **stagnated**: the same validation error twice in a row, or two turns with no new evidence.

## SETUP

1. Tell the person once that the run keeps a record under `.frends/` in the project. Create `.frends/runs/build-loop-<date>-<nn>.md` with a header naming the loop, the subject, the frozen rubric and the cap, and write `.frends/current-run` with exactly two lines: `loop: build-loop` and `record: runs/build-loop-<date>-<nn>.md`.
2. Restate the request as a one-line job story and confirm it with the person.
3. RUBRIC FREEZE: the criteria gating this run are the plan's acceptance criteria, or two to four criteria the person confirms now, plus Part A and Part F of the harness criteria. Write them into the record header. From here this run may not edit them; a criterion that turns out wrong is the person's change to make.
4. Freeze the pattern reference: the archetype reference from the process-patterns skill that fits the job story. It may not be swapped mid-run; a wrong archetype is a reason to stop and ask.
5. Prove the connection with `get_overview`. If it fails, end at blocked.

## EVERY TURN

1. Observe: read the run record and the draft state fresh; after a resume, the record is the memory.
2. Choose the single most valuable in-scope action; read the last reflection first.
3. Act: dispatch `frends:process-builder` with the job story, the frozen criteria, the pattern reference and this turn's delta. When the session cannot run agents, do the builder's steps inline and name the owed review at the end.
4. Verify: the builder's report line must say zero errors after the last change. Then dispatch `frends:draft-reviewer` with the neutral brief "review this draft snapshot against these lenses: the frozen criteria, the plan, Frends conventions", never "confirm", and quote the verdict in full into the record.
5. Record: append `turn N · action · evidence · remaining` to the record; after a failed verify also `reflection: <why> → <what changes next turn>`.

Repeat or stop under the two-tier stop: the hard cap, or two verification passes that changed nothing, or two reflections that say the same thing.

## At DONE

Write `terminal state: <name>` with one sentence of evidence in the final message. Ask the promotion question in the decision shape, and end with the run's open decisions in that shape or the exact line "no open decisions this run". The ledger line in `.frends/ledger.md` and the record's closing `terminal state:` line are written by the plugin's Stop hook, never by you.

Uses (verify against the session's tool list): `get_overview`, `validate_process` and the draft tools through the `frends:process-builder` and `frends:draft-reviewer` agents. Optional: `list_process_drafts` for the clean no-op check.
