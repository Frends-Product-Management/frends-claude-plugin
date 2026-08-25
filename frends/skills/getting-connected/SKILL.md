---
name: getting-connected
description: Connect to a Frends tenant and fix a connection that is not working. Use when the Frends tools are missing, when a call returns 401 or 404, when lists come back empty, or when someone is setting up Frends for the first time.
---

# Getting connected to your Frends tenant

## What the Platform MCP is

The Frends Platform MCP is a server that runs inside your Frends tenant. It lets an AI client read and build integrations in that tenant over the Model Context Protocol.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

## What you need

A Frends tenant with the Platform MCP enabled, and an API token issued by a Private Application in the Frends Portal.

## Find your endpoint

Your Portal address looks like `https://<your-tenant>.frendsapp.com`. The MCP endpoint is that address followed by `/mcp`.

## Create a token

In the Portal, open the admin area and create a Private Application. Grant it the MCP permissions you need, then copy the token it issues. Treat the token like a password. It belongs in your shell environment, never in a file you commit or share.

## Set the two variables

Set these in the environment your AI client will actually see. `FRENDS_MCP_URL` is your MCP endpoint and `FRENDS_MCP_TOKEN` is the token.

macOS and Linux:

```bash
export FRENDS_MCP_URL="https://<your-tenant>.frendsapp.com/mcp"
export FRENDS_MCP_TOKEN="<your token>"
```

Windows PowerShell, for the current session only:

```powershell
$env:FRENDS_MCP_URL = "https://<your-tenant>.frendsapp.com/mcp"
$env:FRENDS_MCP_TOKEN = "<your token>"
```

Windows, for future sessions as well:

```powershell
setx FRENDS_MCP_URL "https://<your-tenant>.frendsapp.com/mcp"
setx FRENDS_MCP_TOKEN "<your token>"
```

Restart the client afterwards, so it reads the new values.

## First check

Call `get_overview`. A working connection returns the Frends version, the Environments and the Agent Groups in the tenant, plus counts of Processes, Tasks and environment variables. Keep the Agent Group IDs it gives you, because other tools ask for them.

## When it does not work

Decide which of these five failures you have before choosing a fix. They have different causes, and only the 401 and 404 cases produce an HTTP status code.

**No Frends tools appear at all, or the server never starts.** Nothing reached the tenant, so there is no status code to read. Almost always the two variables are not set in the environment the client actually sees. Set them and restart the client.

**A call returns 401.** Either the token has expired, or its Private Application is not admitted by the tenant's API Policy. Both are fixed in the Portal.

**A call returns 404.** The Platform MCP is not enabled on this tenant. An administrator turns it on.

**A call succeeds but the list is empty.** This is a normal successful response, not an error. Either the token's permissions do not cover that resource, or the tenant genuinely has nothing that matches. Widen or drop the filter first, then check the permissions.

**Most tools work, but one specific tool is missing.** This is not a broken connection and it does not mean the tenant lacks the capability. A tool appears in the session only when an API Policy targets it and the calling Private Application is granted access, and the platform version also decides which tools exist. Check the API Policy and the grant in the Portal before anything else.

Do not guess between them. Check whether the tools exist at all, then whether one specific tool is missing, then whether a call errors, then whether a successful result is simply empty.

Uses (verify against the session's tool list): `get_overview`, `list_processes`, `list_guides`.
