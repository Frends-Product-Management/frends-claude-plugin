# MCP tool

An AI client calls the Process as a tool and reads the answer.

## Ordered shapes

1. MCP Trigger. The tool name, the description the calling AI client will read, and the input schema. The arguments arrive under `#trigger.data.arguments`.
2. Read the arguments once into Process variables.
3. Call the system. One Task per call.
4. Shape the answer as JSON the AI client can use: named fields, no raw payload dumps.
5. Return shape carrying the JSON.

## Error handling seen in real MCP tools

Every MCP tool Process in the sample answered with a success status whatever happened, and put the outcome in the body: a field saying whether it worked, the data when it did, and a plain message when it did not. One scope and catch around the work produced that failure branch. The reason is the caller: an AI client handles a structured "it failed because X" far better than a transport error it cannot read.

## Usual mistakes

- A tool name or description that does not say what the tool does. That text is all the AI client sees.
- Reading an argument the schema marks optional as if it were always there.
- One tool that does three jobs. Keep it thin: one tool, one job, and a second Process for the second job.
- A trigger whose tool name collides with an older Process's tool name; the older one keeps the name.
