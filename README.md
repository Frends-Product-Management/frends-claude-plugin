# Frends Platform MCP plugin

Work with your Frends tenant from Claude and Codex: find and inspect Processes, diagnose
failed runs, and build integrations. The plugin bundles the tenant connector plus six
skills that teach the AI client how to use the Frends Platform MCP properly.

## Prerequisites

- A Frends tenant with the Platform MCP enabled.
- An API token issued by a Private Application in the Frends Portal.

Your MCP endpoint is your Portal address followed by `/mcp`, for example
`https://<your-tenant>.frendsapp.com/mcp`.

## Install in Claude Code

Add the marketplace and install the plugin:

```
/plugin marketplace add Frends-Product-Management/frends-claude-plugin
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

Open plugin settings, add `Frends-Product-Management/frends-claude-plugin` as a marketplace, then
install the `frends` plugin from it.

On claude.ai and Claude Desktop the plugin installs and its skills work; the live tenant connector currently requires Claude Code or Codex — web and Desktop connector support arrives with Frends' OAuth-based remote MCP.

## Use with Codex CLI

This plugin's connector file is read by Claude clients. For Codex, register the Frends
Platform MCP server directly:

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

Registering the server does not install the skills: `codex mcp add` configures the MCP
connection only. To use the skills from Codex, copy the folders under `frends/skills/`
into a Codex skill discovery location, such as your repository's or your user
`.agents/skills/` directory. No other Codex install path is claimed or tested.

`integration-planning` needs no tenant connection: it interviews and writes a plan, so the same file also works pasted or attached as a plain instruction document in an AI client this repository does not package for.

Set `FRENDS_MCP_TOKEN` in your shell as shown above. The skills in this repository are
written for Claude clients, but the tools work the same way from Codex.

## What you can ask

- Which integrations are deployed, and to which Agent Groups?
- What does this Process actually do, step by step?
- Why did this integration start failing yesterday?
- Which Tasks are available in our tenant, and what parameters does this one take?
- Build me a draft that reads from an endpoint and writes the result somewhere.
- What kind of Process should a nightly sync to our ERP be?
- I want to connect our webshop to our ERP; ask me what you need and write the plan.
- Turn what we just discussed into an integration plan.

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
| `process-patterns` | Choosing the right Process shape before building |
| `integration-planning` | Interviewing for requirements, or synthesizing an earlier conversation, and writing the integration plan before any building |

Plans written by `integration-planning` are aligned with the Frends Integration
Requirements Document (FIRD), the format used to specify a Frends integration for
delivery.

## For maintainers

Every content change must bump `version` in `frends/.claude-plugin/plugin.json`. Claude
clients cache installed plugins by version, so a change shipped without a bump will not
reach anyone who already installed it.

Before a release, keep this README's skill count and Contents table in sync with
`frends/skills/`, and keep the "Check the session's tool list first" paragraph
byte-identical across the skills that carry it.

## Acknowledgments

The interview and plan-synthesis discipline in `integration-planning` adapts patterns
from Matt Pocock's MIT-licensed skills repository
(https://github.com/mattpocock/skills).

## License

MIT. See [LICENSE](LICENSE).
