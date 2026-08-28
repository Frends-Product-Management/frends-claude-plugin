#!/bin/bash
# Release checks. Run from the repository root: bash scripts/check.sh
# Exits 1 on any finding. A clean run proves only that these defects are absent.
cd "$(dirname "$0")/.." || exit 2
fail=0
say() { echo "== $1"; }

say "json files parse"
for j in frends/.claude-plugin/plugin.json .claude-plugin/marketplace.json frends/.mcp.json frends/hooks/hooks.json; do
  python3 -m json.tool "$j" >/dev/null 2>&1 || { echo "  cannot parse $j"; fail=1; }
done

say "no em dashes"
grep -rn --include=*.md --include=*.js --include=*.json -e '—' -e ' – ' . | grep -v '^./.git/' && fail=1

say "the capability guard is byte-identical in every skill"
n=$(for f in frends/skills/*/SKILL.md; do awk '/^## Check the session/{p=1;c=0} p{print; c++} c==3{exit}' "$f" | shasum; done | sort -u | wc -l | tr -d ' ')
[ "$n" = 1 ] || { echo "  $n different guard texts"; fail=1; }

say "every tool name in the skills and the agent is a served tool"
grep -rhoE '`[a-z_]+`' frends/skills frends/agents | tr -d '`' | sort -u | grep '_' \
  | grep -vE '^(acceptance_criteria|confirmation_status|credentials_needed|current_behavior|depends_on|existing_process|out_of_scope)$' \
  | while read -r t; do grep -qx "$t" docs/served-tool-names.txt || echo "  not served: $t"; done | grep . && fail=1
grep -o 'mcp__plugin_frends_frends__[a-z_]*' frends/agents/*.md | sed 's/.*__//' \
  | while read -r t; do grep -qx "$t" docs/served-tool-names.txt || echo "  agent lists an unserved tool: $t"; done | grep . && fail=1

say "the permission matcher gates exactly these five tools"
M=$(python3 -c 'import json;print(json.load(open("frends/hooks/hooks.json"))["hooks"]["PreToolUse"][0]["matcher"])')
gated=$(while read -r t; do echo "mcp__plugin_frends_frends__$t" | grep -qE "^($M)$" && echo "$t"; done < docs/served-tool-names.txt | sort | tr '\n' ' ')
[ "$gated" = "create_environment_variable create_process_from_draft deploy_process import_task start_process " ] || { echo "  gated: $gated"; fail=1; }

say "the hook answers ask on each test input, and never echoes a value"
for j in '{}' 'not json' \
  '{"tool_name":"mcp__plugin_frends_frends__create_process_from_draft","tool_input":{"request":{"draftId":7,"activate":true}}}' \
  '{"tool_name":"mcp__plugin_frends_frends__create_process_from_draft","tool_input":{"draftId":7}}' \
  '{"tool_name":"mcp__plugin_frends_frends__deploy_process","tool_input":{"sourceDeploymentId":1,"targetAgentGroupId":2}}' \
  '{"tool_name":"mcp__plugin_frends_frends__deploy_process","tool_input":{"sourceDeploymentId":1,"targetAgentGroupId":2,"activateTriggers":false}}' \
  '{"tool_name":"mcp__plugin_frends_frends__import_task","tool_input":{"packageId":"Frends.HTTP","packageVersion":"1.2.3"}}' \
  '{"tool_name":"mcp__plugin_frends_frends__start_process","tool_input":{"deploymentId":9,"triggerParameters":{"orderId":"SECRETVALUE"}}}' \
  '{"tool_name":"mcp__plugin_frends_frends__start_process","tool_input":{"deploymentId":9,"triggerParameters":{"a":1,"b":1,"c":1,"d":1,"e":1,"f":1,"g":1,"h":1,"i":1,"j":1,"k":1,"l":"SECRETVALUE"}}}' \
  '{"tool_name":"mcp__plugin_frends_frends__create_environment_variable","tool_input":{"groupName":"G","variableName":"V","type":"Secret","value":"SECRETVALUE"}}'; do
  out=$(echo "$j" | node frends/hooks/ask-before-leaving-the-draft.js) || { echo "  hook crashed on: $j"; fail=1; continue; }
  echo "$out" | python3 -c 'import sys,json; d=json.load(sys.stdin)["hookSpecificOutput"]; assert d["hookEventName"]=="PreToolUse" and d["permissionDecision"]=="ask" and len(d["permissionDecisionReason"])<=600' 2>/dev/null || { echo "  bad answer for: $j"; fail=1; }
  echo "$out" | grep -q SECRETVALUE && { echo "  value echoed for: $j"; fail=1; }
  echo "$j" | grep -q '"l":' && { echo "$out" | grep -q "and 2 more" || { echo "  omitted parameter names not counted"; fail=1; }; }
done

say "no internal paths or private tooling in public files"
grep -rnE '/Users/|\.coord|claude-flow|Obsidian' frends README.md docs .out-of-scope CHANGELOG.md | grep -v '.claude-plugin' && fail=1

say "version and counts agree"
v=$(python3 -c 'import json;print(json.load(open("frends/.claude-plugin/plugin.json"))["version"])')
grep -q "^## $v" CHANGELOG.md || { echo "  CHANGELOG has no $v section"; fail=1; }
s=$(ls -d frends/skills/*/ | wc -l | tr -d ' ')
grep -qE "\b$s skills\b" README.md || { echo "  README does not say $s skills"; fail=1; }

echo "result: $([ $fail = 0 ] && echo clean || echo FINDINGS)"
exit $fail
