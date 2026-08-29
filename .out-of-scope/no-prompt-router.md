# No routing table in a hook or a skill body

A session-start hook that lists which skill answers which prompt, or a router skill that reads the request and names the skill to use, is out of scope.

## Why this is out of scope

The skill descriptions are the routing surface: they are what the client reads when choosing, and they are the only place a boundary can act before the choice is made. A second table would drift from the descriptions, and the copy that is wrong wins unpredictably. This decision is already recorded from the description side in docs/eval-prompts.md, which tests the descriptions and is deliberately the one routing table in the repository.

## What would have to change

A client mechanism that consults an explicit routing document at choice time. Until one exists, routing lives in the descriptions and is tested by hand from the eval prompts.
