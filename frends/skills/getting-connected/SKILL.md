---
name: getting-connected
description: Connect an AI client to a Frends tenant, and work out why the connection itself is not working. Use when the Frends tools are missing, when a call returns 401 or 404, when lists come back empty, when one specific tool is absent, or when someone is setting up Frends for the first time. Do not use when the connection works and a Process run failed, which is a diagnosis.
---

# Getting connected to your Frends tenant

The Frends Platform MCP is a server that runs inside your Frends tenant. It lets an AI client read and build integrations in that tenant over the Model Context Protocol.

Setup is a walkthrough, not a page of instructions. Take one stage per message, ending each with the single thing the person does next, so nothing they still need has scrolled away. If they arrived with a specific symptom rather than a fresh setup, go straight to the symptom table at the end.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## Stage 0: see what is already done, then agree the stages

Look before you ask. If the Frends tools are in this session's tool list, call `get_overview`: when it answers, the connection already works. Say so, hand over the Frends version, the Environments and the Agent Group IDs, and stop. There is nothing to set up and no reason to restart anything. When the tools are absent, or the call fails, the walkthrough starts at stage 1.

Then show the four stages and what each one produces, and let the person drop any that are already done.

Done when they have seen the stages and agreed where to start.

## Stage 1: your endpoint

Ask for the tenant name only, and build the address from it: a Portal at `https://<your-tenant>.frendsapp.com` has its MCP endpoint at that address followed by `/mcp`.

Done when the endpoint is written out in full and they confirm the tenant name is right.

## Stage 2: a token from the Portal

Send them to the page before you ask for anything from it. In the Portal, open the admin area, create a Private Application, grant it the MCP permissions they need, and copy the token it issues.

Then ask one thing: whether they have it copied. Never ask them to paste the token into this conversation, and never repeat it back. It goes into their own shell environment and nowhere else.

Say one more thing while they are in the Portal: every tool call made through this connection is written to the tenant's audit log with its arguments, under the Private Application's name. That is why no secret ever travels as a tool argument.

Done when they say the token is copied and it has not been typed into the conversation.

## Stage 3: two environment variables

Ask which operating system they are on, and on Windows whether they want the values for this session only or kept for later, then give the one command block that fits. `FRENDS_MCP_URL` is the endpoint from stage 1, and `FRENDS_MCP_TOKEN` is the token from stage 2, pasted by them in place of the placeholder.

macOS and Linux:

```bash
export FRENDS_MCP_URL="https://<your-tenant>.frendsapp.com/mcp"
export FRENDS_MCP_TOKEN="<paste-your-token-here>"
```

Windows PowerShell, for this session only:

```powershell
$env:FRENDS_MCP_URL = "https://<your-tenant>.frendsapp.com/mcp"
$env:FRENDS_MCP_TOKEN = "<paste-your-token-here>"
```

Windows, kept for future sessions:

```powershell
setx FRENDS_MCP_URL "https://<your-tenant>.frendsapp.com/mcp"
setx FRENDS_MCP_TOKEN "<paste-your-token-here>"
```

Set them in the environment the AI client itself will see, which is the shell the client starts from.

Done when both variables are set in that environment.

## Stage 4: restart, then check

Restarting the client ends this conversation, so say what happens next before they do it: the client reads the new values on startup, and the first thing to ask for afterwards is the tenant overview.

After the restart, call `get_overview`. A working connection returns the Frends version, the Environments and the Agent Groups in the tenant, plus counts of Processes, Tasks and environment variables. Keep the Agent Group IDs it gives you, because other tools ask for them.

Close by saying what is now working and what is still owed by hand, such as an administrator who has to enable the Platform MCP or widen an API Policy.

Done when `get_overview` returns the version, the Environments and the Agent Groups.

## When it does not work

Work through the checks in this order: whether any Frends tools are there at all, then whether one specific tool is missing, then whether a call returns an error, then whether a successful call is simply empty. Only the 401 and 404 rows produce an HTTP status code.

| What you see | What it means | What fixes it |
|---|---|---|
| No Frends tools at all, or the server never starts | Nothing reached the tenant, so there is no status code to read | The two variables are almost certainly not set in the environment the client sees. Set them and restart the client |
| Most tools work, one specific tool is missing | Not a broken connection, and not proof the tenant lacks that capability. A tool appears only when an API Policy targets it and the calling Private Application is granted access, and the platform version also decides which tools exist | Check the API Policy and the grant in the Portal |
| A call returns 401 | The token has expired, or its Private Application is not admitted by the tenant's API Policy | Both are fixed in the Portal |
| A call returns 404 | The Platform MCP is not enabled on this tenant | An administrator turns it on |
| A call succeeds but the list is empty | A normal successful response, not an error. Either the token's permissions do not cover that resource, or the tenant has nothing matching | Widen or drop the filter first, then check the permissions |

Uses (verify against the session's tool list): `get_overview`, `list_processes`, `list_guides`.
