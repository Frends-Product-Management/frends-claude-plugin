# The plugin does not restate the server's guides

The Frends Platform MCP server serves its own guides through `get_guide`, and those guides own the tool mechanics: how a draft is created, how Task parameters and modes work, which reference values exist, how promotion and execution work. A plugin skill routes to the guide that fits and adds only what the guide does not carry: the order to work in, where the work stops, and the checks the guides do not make. Requests to copy guide content into a skill "so the model has it without a call" are out of scope.

## Why this is out of scope

Two copies of one rule drift. The server's guides change with the platform version and reach every AI client that connects; a copy in this repository reaches only the people who updated the plugin, and it keeps saying what the guide used to say. The first version of this plugin carried such copies, and one of them contradicted the served guide within weeks. A router that fetches the guide in the session is always as current as the tenant it is connected to.

The one thing the plugin does say about a guide's content is where the plugin stops earlier than the guide continues: the build skill ends at a validated draft while the process-authoring guide goes on to promote. That is a boundary, stated as a boundary, not a copy.

The escape hatches already exist:

- `docs/ownership.md` names the single owner of every kind of statement, so a rule that belongs in a guide can be sent to the server's maintainers instead of copied here.
- A check the guides do not make is in scope; the build and review skills carry those.

## Prior requests

- "Some of the skills contradict the guides the server itself serves; they should at most be pointers to the built-in guides." (received while 0.5.0 was current; this decision is the answer)
