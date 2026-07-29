---
name: find-and-inspect
description: Find Processes in a Frends tenant and explain how one is built. Use when someone asks what integrations exist, where a Process is deployed, which version is live, what a Process does internally, or which Tasks and environment variables the tenant has.
---

# Finding and inspecting Processes

## Start broad, then narrow

`list_processes` returns the Processes that are deployed to at least one Agent Group. It returns one entry per Process and Agent Group pair, so the same Process appears once for each Agent Group it is deployed to, each with its own version. Every entry carries a process id, a deployment id, the Process GUID, the name, the deployed version, the Agent Group, tags, and the manual trigger parameters.

Two things follow from that shape. Drafts do not appear here, so use `list_process_drafts` for work in progress. And a name you see several times is usually one Process deployed to several Agent Groups, not a duplicate.

## Read one Process

`get_process_data` returns the full data model for a single Process: the BPMN, the element parameters, the process variables and the manual trigger configuration. Pass the deployment id for a deployed Process or the draft id for a draft, but not both.

When you want the shape of a Process rather than the whole model, `process_get_structure` gives the tree of shapes with their ids, types and outgoing connections. It reads drafts only. To outline a deployed Process, fork it to a draft first. `process_get_shape_config` reads the full configuration of one shape.

## Tenant context

`get_overview` gives the Frends version, the Environments and the Agent Groups. `list_environment_variables` lists the environment variable groups with their per-environment values. These are Frends environment variables managed in the Portal, which are a different thing from the variables you set on your own machine to connect.

## Tasks

`list_tasks` and `search_task_packages` find the Tasks installed in the tenant. `inspect_task` returns one Task's parameter schema and return type, which is what you need before wiring it into a Process.

## How to answer

Summarise. Do not paste raw JSON at someone. A useful answer names the Process, its deployed version, the Agent Group and the Environment, and then the specific thing that was asked.

Keep the identifiers you were given. The deployment id and draft id are what the next call needs, and losing them means starting the search again.

Point back to the Portal for anything visual and anything the user has to decide. A Process is far easier to read as a diagram than as BPMN, and version history, deployment state and permissions all live there.

Works with: `list_processes`, `list_process_drafts`, `get_process_data`, `process_get_structure`, `process_get_shape_config`, `get_overview`, `list_environment_variables`, `list_tasks`, `search_task_packages`, `inspect_task`.
