# No skill per Task or per connected system

The plugin ships a small set of skills about working with Frends. It will not ship a skill for one Task or one third-party system, such as a Salesforce skill or an SAP skill. Requests to add one are out of scope.

## Why this is out of scope

Every skill's description is loaded in every session, whether or not it fires, so each one costs attention on every request the AI client handles. A per-system skill pays that cost permanently to say something the tenant can already answer at the moment it matters: `list_tasks` shows what is installed, and `inspect_task` returns the exact parameter template for the Task in front of you.

The test is not how many Tasks exist. It is whether a skill would change what the AI client does beyond what the tool list and the Task template already tell it. Judgement, ordering, and knowing when to stop are worth a skill. Field names are not: they are already served, and a copy of them goes stale on its own.

The escape hatches already exist:

- `process-patterns` covers how to shape an integration.
- `list_tasks` and `inspect_task` cover what a tenant has and how to configure it.
- The served guides cover platform specifics and are versioned with the platform.

## Prior requests

None yet.
