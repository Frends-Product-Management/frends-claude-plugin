# Frends Platform MCP plugin

Work with your Frends tenant from Claude Code: find and inspect Processes, diagnose failed
runs, plan and build integrations, review the draft, and run a Process on your say-so. The
plugin bundles the tenant connector, 12 skills, three agents, a bounded loop harness with
its gates, a delivery workflow, and a permission hook that asks you before anything leaves
the draft stage.

The Frends Platform MCP server serves its own guides for the tool mechanics. The skills here
route to those guides and add what they do not carry: the order to work in, where the work
stops, and the checks validation cannot make. Nothing in this plugin restates a guide.

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

## The permission prompt, and the two ways it can be absent

Five tools change something outside a draft: promoting a draft, deploying a version, starting
a run, importing a Task package, and creating an environment variable. The plugin's hook makes
Claude Code ask you before any of them runs, with a plain sentence on what is about to happen.
It asks; it never denies, and it never prompts for draft edits.

Two things remove the prompt, so know them before you rely on it. A hook that takes longer than
its timeout is dropped and the call proceeds; the script reads its input and answers in well
under a second, with no network call, so this is a Node-is-missing symptom rather than a
normal one. And `disableAllHooks` in your settings turns off every hook, this one included.
A permission rule in your own settings survives both. Add this to your user or project
`settings.json`:

```json
{
  "permissions": {
    "ask": [
      "mcp__plugin_frends_frends__create_process_from_draft",
      "mcp__plugin_frends_frends__deploy_process",
      "mcp__plugin_frends_frends__start_process",
      "mcp__plugin_frends_frends__import_task",
      "mcp__plugin_frends_frends__create_environment_variable"
    ]
  }
}
```

Check that the hook is wired: ask Claude Code to promote a throwaway draft. You must be asked
before anything happens. If it promotes without asking, the hook is not running; check that
`node` is on the PATH Claude Code starts from.

The hook needs Node.js. The prompt is interactive by design, so in a non-interactive run the
call waits for an answer that cannot come; do not script these five tools.

## Use with Codex CLI

The skills are written for Claude Code. For Codex, register the Frends Platform MCP server
directly:

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

Set `FRENDS_MCP_TOKEN` in your shell as shown above. The hook and the review agent are Claude
Code features and do not carry over; from Codex the conversation-level stops in the skills are
the only gate.

## What you can ask

- Which integrations are deployed, and to which Agent Groups?
- What does this Process actually do, step by step?
- Why did this integration start failing yesterday?
- Which Tasks are available in our tenant, and what parameters does this one take?
- Build me a draft that reads from an endpoint and writes the result somewhere.
- Is this draft ready to promote?
- Run the order sync once with these values.
- What kind of Process should a nightly sync to our ERP be, and which shapes go where?
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
| `build-a-process` | Building a draft up to a passing validation, in slices, with a bounded fix loop |
| `review-a-draft` | Checking a finished draft against the plan and against the served conventions, on two axes |
| `run-a-process` | Running a deployed Process after the confirmation the served guide requires |
| `process-patterns` | Choosing the right Process shape before building, with a reference per shape |
| `integration-planning` | Interviewing for requirements, or synthesizing an earlier conversation, and writing the integration plan before any building |
| `harness` | The working rules every loop and agent runs under: the six ways a run ends, the record grammar, who reviews whom, and what is never written down |
| `build-loop` | A bounded build loop from a request or a confirmed plan to a validated draft, with a run record and an independent review before success |
| `fix-loop` | A bounded fix loop for a Process failing in an Environment, from ranked diagnosis through the person's chosen cause to a validated edit draft |
| `deliver-loop` | The delivery loop over a confirmed plan, two independent reviews per Process; invoked by name only |

Plans written by `integration-planning` are aligned with the Frends Integration
Requirements Document (FIRD), the format used to specify a Frends integration for
delivery.

| Other parts | What they do |
|---|---|
| `hooks/` | The permission prompt before the five tools above, the loop gates below, and context at session start |
| `agents/process-builder` | Builds one draft per dispatch up to a passing validation; not granted the five tools that leave the draft stage |
| `agents/draft-reviewer` | A read-only agent that reads one draft snapshot on one review axis and returns findings in a checked shape |
| `agents/failure-diagnoser` | Read-only; returns ranked causes for a failing Process with run evidence, proposes no fix |
| `workflows/deliver-an-integration.js` | The deliver-loop's non-interactive form, run as `/frends:deliver-an-integration` |
| `.frends/` in your project | Run records, the run ledger and your accepted decisions; created only after a loop tells you once |
| `docs/ownership.md` | Which statements the plugin may own, and which belong to the server's guides |
| `docs/served-tool-names.txt` | The tool names the server serves, which the checks hold the skills to |
| `scripts/check.sh` | The release checks |

## The harness

The three loop skills run the same protocol, written in the `harness` skill: one bounded
change per turn, verified by `validate_process`, recorded in a run record under `.frends/`
in your project, and ended in one of six named states, `success`, `clean no-op`, `blocked`,
`approval-required`, `exhausted` or `stagnated`. A failure is named, never dressed up as
success. The one who builds a draft never judges it: the builder agent reports, a reviewer
agent verdicts, and promoting, deploying, running, importing a Task package and creating an
environment variable stay your decisions in every loop.

Three hooks gate the protocol mechanically. A recorder appends every draft mutation and
validation to the open run record. A Stop gate refuses, once, a run that claims `terminal
state: success` when the record shows the last validation ran before the last change, and
writes the ledger line when a run closes. A verdict gate bounces, once, an agent report
that is missing its required sections. Every gate message opens with the same sentence:
"GATE RESULT ONLY, presence and order, not evidence of quality." A gate can fail work;
only the reviewer and you can pass it. The gates fail open on their own errors and write a note to stderr, which Claude Code keeps in its hook debug output, not in the conversation.

Self-tests you can run in your own session: open a loop run, make one draft change, then
claim `terminal state: success` without validating, and the stop must be blocked exactly
once with that banner. Ask the reviewer agent for a verdict and delete its `Count:` line
from the brief's required shape, and the report must bounce exactly once.

## Is it working?

What you should see when each skill is doing its job. Every line is something you can check in your own session.

**getting-connected.** If you are already connected, you are told so and handed your Environments and Agent Group IDs, rather than walked through a setup you do not need. Otherwise you are shown the stages before you are asked to do any of them. The Portal page and the click path arrive before any question about the token, and you are never asked to paste the token into the conversation. You are asked which operating system you are on, and get only the commands for it, rather than every platform's at once. `get_overview` comes back with your Frends version, Environments and Agent Groups.

**find-and-inspect.** You get names, versions and Agent Groups rather than an explanation of how to look them up. Environment variables come back as names, without their values. Nothing in the tenant changed.

**diagnose-failures.** You are shown three to five possible causes, ranked, before anything is tested. The reasoning points at a specific run you can open yourself. Where the evidence stops, you are told what is unproven instead of given a guess. Nothing was retried or repaired.

**process-patterns.** You get two or three named shapes and the trade-off between them, tied to something you said about your own integration. No draft appears; if one does, the wrong skill fired.

**integration-planning.** Questions arrive one topic at a time and numbered, and where a suggested answer comes with one, you can turn it down. Nothing you have already said is asked again. You hear the understanding read back in plain language before any document is written, and the plan that follows names the systems, the trigger and the failure handling in words you used.

**build-a-process.** The served process-authoring guide is fetched before anything is created. When the work spans several Processes you see the build order and approve it first. What is created is a draft. Validation is run and its result is shown to you rather than asserted; the same error is not guessed at more than three times; and nothing is promoted or deployed. You are told what promoting would do and asked to decide it separately.

**run-a-process.** Nothing runs before you have confirmed the Process, the Environment, the parameters and the side effects in the form the served guide asks for, and Claude Code prompts you once more before the call. A draft is never promoted in order to test it.

**review-a-draft.** The served guide's pitfall list is applied first and quoted per finding. Findings arrive under two separate headings and are never merged into one ranked list. Every finding on the plan axis quotes the plan line behind it. Anything a run would have to settle is listed as not verified rather than counted as passed. Nothing in the draft is changed by the review, and no draft is created to review a deployment unless you asked for one.

## For maintainers

`scripts/check.sh` runs the release checks: the manifests parse, the capability guard is
byte-identical across skills, every tool name in a skill or the agent is in
`docs/served-tool-names.txt`, the permission matcher gates exactly the five tools, the hook
answers `ask` on every input and never echoes a value, the loop gates fire, pass and fail
open against checked-in fixtures, the loop skills carry the full anatomy, the agents cannot
leave the draft stage, and no internal path reaches a public file. Run it before every
release. What it cannot check, and what was not exercised before 0.7.0: the prompt appearing
in a live Claude Code session, its behaviour in bypass mode and with hooks disabled, the
agents' tool allowlists and whether their `skills` preload loads the harness, the live Stop
and SubagentStop behaviour in a real session, the workflow's first run, and Node on Windows.
Treat those as claims to verify in your own session, with the self-tests above.

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

[docs/ownership.md](docs/ownership.md) says which kinds of statement the plugin may own. A
sentence whose owner is a served guide is a pointer to that guide, never a copy.

[docs/eval-prompts.md](docs/eval-prompts.md) lists the prompts each skill should and
should not answer, and is the only routing table in the repository. Run through it by hand before a release: the descriptions are the only
thing an AI client sees when choosing a skill, so a description change is a routing
change.

## Acknowledgments

The interview and plan-synthesis discipline in `integration-planning` adapts patterns
from Matt Pocock's MIT-licensed skills repository
(https://github.com/mattpocock/skills).

## License

MIT. See [LICENSE](LICENSE).
