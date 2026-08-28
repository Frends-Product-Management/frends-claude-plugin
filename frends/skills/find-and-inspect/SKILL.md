---
name: find-and-inspect
description: Find Processes in a Frends tenant and explain how one is built, without changing anything. Use when someone asks what integrations exist, where a Process is deployed, which version is live, what a Process does internally, whether something that already does a job exists, or which Tasks and environment variables the tenant has. Do not use to build, change, run or diagnose anything.
---

# Finding and inspecting Processes

This work is reading. Nothing in the tenant changes.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Fetch the guide that matches the question

The server carries a guide for each kind of reading. Call `get_guide` with the one that fits and follow it for the mechanics: `search-processes` for finding Processes by name, tag, Environment, Agent Group or trigger; `find-integration` when the question is whether something reusable already exists for a need; `explore-tasks` for what Tasks are installed or available and what a Task takes; `manage-environments` for Environments, Agent Groups, their ids and environment variables. When one question needs two guides, read both. If `get_guide` fails, call `list_guides`, say what is missing, and work from the tool descriptions.

## What this skill adds

**Nothing is created here.** To read how a deployed Process is built, use `get_process_data` with its `deploymentId`; it returns the full definition. The shape-level tools read drafts only, and turning a deployment into a draft is build work: do it only when the user asks for it in so many words, and tell them the draft it leaves behind.

**Environment variable values stay out of the answer.** Report names and groups. Print a value only when the user asks for that specific value, and never one that looks like a secret.

**Answer in names, not in JSON.** A useful answer names the Process, its deployed version, the Agent Group and the Environment, then the specific thing that was asked. Keep the `deploymentId` and `draftId` you were given, because the next call needs them.

**Point back to the Portal for anything visual and anything the user has to decide.** A Process is easier to read as a diagram than as a definition, and version history, deployment state and permissions live there.

Uses (verify against the session's tool list): `get_guide`, `list_guides`, `list_processes`, `list_process_drafts`, `get_process_data`, `process_get_structure`, `process_get_shape_config`, `get_overview`, `list_environment_variables`, `list_tasks`, `search_task_packages`, `inspect_task`.
