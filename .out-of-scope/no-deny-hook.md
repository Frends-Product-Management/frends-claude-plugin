# The permission hook asks, it never denies

The plugin ships a hook that asks the person before a tool call leaves the draft stage: promoting a draft, deploying a version, starting a run, importing a Task package, creating an environment variable. It answers "ask", so the person sees what is about to happen and decides in the moment. Requests to make the hook deny those calls outright, or to gate every draft edit as well, are out of scope.

## Why this is out of scope

A denial gives the person no way to say yes. Someone who does want to promote would then reach for the only switch that removes a plugin hook, which disables every hook at once and silently. An ask that fires five times in a session and a deny that fires once both end the same way: the hook is turned off and nobody is asked again. The gate protects the five calls whose effects leave the draft, and leaves draft edits alone, because a prompt on every shape teaches people to approve without reading.

The hook is a backstop, not the approval. The conversation-level stop in the build skill is the approval, and it holds when hooks are disabled or time out. The README says how to add a permission rule that survives disabled hooks.

The escape hatches already exist:

- A user who wants a hard block adds a `deny` rule for those tools in their own settings; a plugin cannot ship permission rules, and a person can.
- A token whose scopes exclude `process:deploy` and `process:execute` hides those tools from the session entirely.

## Prior requests

None yet.
