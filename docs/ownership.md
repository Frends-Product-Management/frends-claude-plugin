# Who owns which statement

For maintainers. One statement has one owner. Before adding a sentence to a skill, find its row; if the owner is not the plugin, the sentence is a pointer, not a copy.

| Kind of statement | Owner | Where the plugin may mention it |
|---|---|---|
| How a tool works: parameters, modes, what it returns, its limits | The tool's own description on the server | Never restated. A skill names the tool and says when to call it |
| How to do a job with several tools: draft creation, Task parameters, reference values, promotion mechanics, execution protocol, diagnosis flow, search vocabulary, environment model | The server's guides (`get_guide`) | A router skill names the guide and says "fetch it first". One boundary statement is allowed where the plugin stops earlier than the guide continues |
| What real Processes look like: ordered shapes, error-handling designs, how often something appears | The exported sample behind `process-patterns` | Only in `process-patterns` and its references, with the sample named as the evidence and its size as the limit |
| When to stop, what needs the person's decision, what a run or a promotion costs | Plugin policy | `build-a-process` (Where you stop), `run-a-process`, the hook's reason text, `.out-of-scope/` |
| The order to work in: slices, blockers, the build loop's floor, review axes | Plugin judgement | `build-a-process`, `review-a-draft` |
| Checks validation cannot make and no guide carries | Plugin judgement | `build-a-process` (Checks validation cannot make), `review-a-draft` (axis one, after the guide) |
| How to interview, plan, synthesize and hand off | Plugin methodology | `integration-planning` |
| How to connect and what a failed connection means | Plugin, because no guide covers it | `getting-connected`, README |
| Which skill answers which prompt | The skill descriptions, tested by `docs/eval-prompts.md` | Nowhere else; the session-start hook carries no routing table |

When a plugin-owned check turns out to be in a guide after a platform release, the plugin line is deleted in the next release and the changelog says which guide now owns it.
