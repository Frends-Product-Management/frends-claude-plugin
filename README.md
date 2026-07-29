# Frends Platform MCP plugin

Work with your Frends tenant from Claude and Codex: find and inspect Processes, diagnose
failed runs, and build integrations. The plugin bundles the tenant connector plus four
skills that teach the AI client how to use the Frends Platform MCP properly.

## Prerequisites

- A Frends tenant with the Platform MCP enabled.
- An API token issued by a Private Application in the Frends Portal.

Your MCP endpoint is your Portal address followed by `/mcp`, for example
`https://<your-tenant>.frendsapp.com/mcp`.

## Install in Claude Code

Add the marketplace and install the plugin:

```
/plugin marketplace add FrendsPlatform/frends-claude-plugin
/plugin install frends@frends
```

Then set the two variables in the environment Claude Code will see.

macOS and Linux:

```bash
export FRENDS_MCP_URL="https://<your-tenant>.frendsapp.com/mcp"
export FRENDS_MCP_TOKEN="<your token>"
```

On Windows, `$env:` sets a variable for the current PowerShell session only, while `setx`
stores it for future sessions. Use both if you want it available now and later.

```powershell
$env:FRENDS_MCP_URL = "https://<your-tenant>.frendsapp.com/mcp"
$env:FRENDS_MCP_TOKEN = "<your token>"

setx FRENDS_MCP_URL "https://<your-tenant>.frendsapp.com/mcp"
setx FRENDS_MCP_TOKEN "<your token>"
```

Restart Claude Code so it reads the new values, then ask it to call `get_overview`.

## Install in Claude (web and Desktop)

Open plugin settings, add `FrendsPlatform/frends-claude-plugin` as a marketplace, then
install the `frends` plugin from it.

On claude.ai and Claude Desktop the plugin installs and its skills work; the live tenant connector currently requires Claude Code or Codex — web and Desktop connector support arrives with Frends' OAuth-based remote MCP.

## Use with Codex CLI

Codex does not read this plugin's connector file. It consumes the Frends Platform MCP
directly, so register the server once:

```bash
codex mcp add frends --url "https://<your-tenant>.frendsapp.com/mcp" \
  --bearer-token-env-var FRENDS_MCP_TOKEN
```

That writes the following into your Codex configuration file, which you can also edit by
hand:

```toml
[mcp_servers.frends]
url = "https://<your-tenant>.frendsapp.com/mcp"
bearer_token_env_var = "FRENDS_MCP_TOKEN"
```

Set `FRENDS_MCP_TOKEN` in your shell as shown above. The skills in this repository are
written for Claude clients, but the tools work the same way from Codex.

## What you can ask

- Which integrations are deployed, and to which Agent Groups?
- What does this Process actually do, step by step?
- Why did this integration start failing yesterday?
- Which Tasks are available in our tenant, and what parameters does this one take?
- Build me a draft that reads from an endpoint and writes the result somewhere.

## Troubleshooting

Work out which of these four failures you have before changing anything. Only the two
middle ones produce an HTTP status code, so read the actual response first.

**No Frends tools appear, or the server never starts.** Nothing reached the tenant, so
there is no status code. Almost always `FRENDS_MCP_URL` and `FRENDS_MCP_TOKEN` are not set
in the environment the client actually sees. Set them and restart the client.

**A call returns 401.** Either the token has expired, or its Private Application is not
admitted by the tenant's API Policy. Both are fixed in the Portal.

**A call returns 404.** The Platform MCP is not enabled on this tenant. An administrator
turns it on.

**A call succeeds but the list is empty.** That is a successful response, not an error.
Either the token's permissions do not cover that resource, or the tenant genuinely has
nothing matching. Widen or drop the filter first, then check the permissions.

## Contents

| Skill | Use it for |
|---|---|
| `getting-connected` | First setup and fixing a connection that does not work |
| `find-and-inspect` | Finding Processes and explaining how one is built |
| `diagnose-failures` | Investigating failed runs, read-only |
| `build-a-process` | Building a draft up to a passing validation |

## For maintainers

Every content change must bump `version` in `frends/.claude-plugin/plugin.json`. Claude
clients cache installed plugins by version, so a change shipped without a bump will not
reach anyone who already installed it.

## License

MIT. See [LICENSE](LICENSE).
