---
name: getting-connected
description: Connect to a Frends tenant and fix a connection that is not working. Use when the Frends tools are missing, when a call returns 401 or 404, when lists come back empty, or when someone is setting up Frends for the first time.
---

# Getting connected to your Frends tenant

## What the Platform MCP is

The Frends Platform MCP is a server that runs inside your Frends tenant. It lets an AI client read and build integrations in that tenant over the Model Context Protocol.

## What you need

A Frends tenant with the Platform MCP enabled, and an API token issued by a Private Application in the Frends Portal.

## Find your endpoint

Your Portal address looks like `https://<your-tenant>.frendsapp.com`. The MCP endpoint is that address followed by `/mcp`.

## Create a token

In the Portal, open the admin area and create a Private Application. Grant it the MCP permissions you need, then copy the token it issues. Treat the token like a password. It belongs in your shell environment, never in a file you commit or share.

## Set the two variables

Set these in the environment your AI client will actually see:

- `FRENDS_MCP_URL` is your MCP endpoint.
- `FRENDS_MCP_TOKEN` is the token.

On macOS or Linux:

```bash
export FRENDS_MCP_URL="https://<your-tenant>.frendsapp.com/mcp"
export FRENDS_MCP_TOKEN="<your token>"
```

On Windows, `$env:NAME = "value"` sets a variable for the current PowerShell session, and `setx NAME "value"` sets it for future sessions. You usually want both.

Restart the client after setting them, so it reads the new values.

## First check

Call `get_overview`. A working connection returns the Frends version, the Environments and the Agent Groups in the tenant, plus counts of Processes, Tasks and environment variables. If that answers, try `list_processes`.

## When it does not work

Four failures cover almost every case. Read the actual error before you act, because the fix differs.

**No Frends tools appear, or the server never starts.** The two variables are not set in the environment the client sees. Set them and restart the client.

**401 Unauthorized.** Either the token has expired, or its Private Application is not admitted by the tenant's API Policy. Both are fixed in the Portal.

**404 Not Found.** The Platform MCP is not enabled on this tenant. An administrator turns it on.

**A call succeeds but the list is empty.** Either the token's permissions do not cover that resource, or the tenant genuinely has nothing that matches. Widen or drop the filter first, then check the permissions.

Do not guess between these. The status code tells you which one you have.

Works with: `get_overview`, `list_processes`, `list_guides`.
