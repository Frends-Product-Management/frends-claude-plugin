# Frends Platform MCP plugin

Work with your Frends tenant from Claude and Codex: find and inspect Processes, diagnose
failed runs, and build integrations. The plugin bundles the tenant connector plus seven
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

On claude.ai and Claude Desktop the plugin installs and its skills work; the live tenant connector currently requires Claude Code or Codex; web and Desktop connector support arrives with Frends' OAuth-based remote MCP.

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

Work out which of these five failures you have before changing anything. Only the 401
and 404 cases produce an HTTP status code, so read the actual response first.

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

**Most tools work, but one specific tool is missing.** Not a broken connection, and not
proof the tenant lacks the capability. A tool appears in the session only when an API
Policy targets it and the calling Private Application is granted access, and the platform
version also decides which tools exist. Check the API Policy and the grant in the Portal.

## Contents

| Skill | Use it for |
|---|---|
| `getting-connected` | First setup and fixing a connection that does not work |
| `find-and-inspect` | Finding Processes and explaining how one is built |
| `diagnose-failures` | Investigating failed runs, read-only |
| `build-a-process` | Building a draft up to a passing validation |
| `review-a-draft` | Checking a finished draft against the plan and against Frends conventions |
| `process-patterns` | Choosing the right Process shape before building |
| `integration-planning` | Interviewing for requirements, or synthesizing an earlier conversation, and writing the integration plan before any building |

Plans written by `integration-planning` are aligned with the Frends Integration
Requirements Document (FIRD), the format used to specify a Frends integration for
delivery.

## Is it working?

What you should see when each skill is doing its job. Every line is something you can check in your own session.

**getting-connected.** If you are already connected, you are told so and handed your Environments and Agent Group IDs, rather than walked through a setup you do not need. Otherwise you are shown the stages before you are asked to do any of them. The Portal page and the click path arrive before any question about the token, and you are never asked to paste the token into the conversation. You are asked which operating system you are on, and get only the commands for it, rather than every platform's at once. `get_overview` comes back with your Frends version, Environments and Agent Groups.

**find-and-inspect.** You get names, versions and Agent Groups rather than an explanation of how to look them up. Environment variables come back as names, without their values. Nothing in the tenant changed.

**diagnose-failures.** You are shown three to five possible causes, ranked, before anything is tested. The reasoning points at a specific run you can open yourself. Where the evidence stops, you are told what is unproven instead of given a guess. Nothing was retried or repaired.

**process-patterns.** You get two or three named shapes and the trade-off between them, tied to something you said about your own integration. No draft appears; if one does, the wrong skill fired.

**integration-planning.** Questions arrive one topic at a time and numbered, and where a suggested answer comes with one, you can turn it down. Nothing you have already said is asked again. You hear the understanding read back in plain language before any document is written, and the plan that follows names the systems, the trigger and the failure handling in words you used.

**build-a-process.** When the work spans several Processes you see the build order and approve it first. What is created is a draft. Validation is run and its result is shown to you rather than asserted, and nothing is promoted or deployed.

**review-a-draft.** Findings arrive under two separate headings and are never merged into one ranked list. Every finding on the plan axis quotes the plan line behind it. Anything a run would have to settle is listed as not verified rather than counted as passed. Nothing in the draft is changed by the review.

## For maintainers

Every content change must bump `version` in `frends/.claude-plugin/plugin.json`. Claude
clients cache installed plugins by version, so a change shipped without a bump will not
reach anyone who already installed it.

Before a release, keep this README's skill count and Contents table in sync with
`frends/skills/`, and keep the "Check the session's tool list first" paragraph
byte-identical across the skills that carry it. That paragraph is deliberately
duplicated rather than shared: a skill body loads on its own, so a guard kept
anywhere else would not be there when the skill runs.

Every behavioural change gets an entry in [CHANGELOG.md](CHANGELOG.md), including a
change to a skill's `description`. The description is what decides whether a skill is
chosen at all, so editing it changes behaviour as surely as editing the body does.

Rejected ideas are recorded in [.out-of-scope/](.out-of-scope/) so each decision is made
once. Before answering a feature request, read those files: the answer may already be
written, and if the reasoning has expired the file says what would have to change.

[docs/eval-prompts.md](docs/eval-prompts.md) lists the prompts each skill should and
should not answer. Run through it by hand before a release: the descriptions are the only
thing an AI client sees when choosing a skill, so a description change is a routing
change.

## Acknowledgments

The interview and plan-synthesis discipline in `integration-planning` adapts patterns
from Matt Pocock's MIT-licensed skills repository
(https://github.com/mattpocock/skills).

## License

MIT. See [LICENSE](LICENSE).
