# Connection settings are read from the environment, not from a file

The plugin reads `FRENDS_MCP_URL` and `FRENDS_MCP_TOKEN` from the environment the AI client runs in. It will not read a token from a configuration file, a committed `.env`, or a plugin setting. Requests to make setup "one file instead of two variables" are out of scope.

## Why this is out of scope

A file gets committed. Not usually, not deliberately, but often enough, and a token in a repository history is a tenant credential that outlives the person who added it. An ignore rule is a convention, not a control, and it fails silently the first time someone copies the file somewhere else.

The escape hatches already exist:

- Any secret manager or environment tool a team already uses can set the two variables.
- AI clients that support their own secret storage can hold them there.
- A shell profile keeps them across sessions for a single developer machine.

## Prior requests

None yet.
