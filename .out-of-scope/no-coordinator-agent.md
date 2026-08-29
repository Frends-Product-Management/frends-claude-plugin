# No coordinator agent above the loops

An agent whose job is to run the loops, dispatch the builder and the reviewers, and report back when everything is done is out of scope. The loops run in the person's own session, where the person can see every turn.

## Why this is out of scope

The loops exist to keep decisions with the person: the frozen rubric, the chosen cause, the accepted finding, the promotion question. A coordinator agent would batch those decisions behind one opaque dispatch and hand back a summary, which is exactly the shape the harness names as a failure ("success, with open questions" is approval-required, not success). It would also stack agent-inside-agent limits the platform does not promise.

The delivery workflow already covers the honest version of this want: a deterministic fan-out the person starts by name, with the per-Process table and the promotion question back.

## What would have to change

A person asking for less visibility is not a reason. A platform mechanism that lets a subagent raise a blocking question to the person mid-run would be.
