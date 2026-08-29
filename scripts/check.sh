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
# the harness skill calls no tenant tool, so it carries no guard; excluded by design
n=$(for f in frends/skills/*/SKILL.md; do [[ "$f" == */skills/harness/* ]] && continue; awk '/^## Check the session/{p=1;c=0} p{print; c++} c==3{exit}' "$f" | shasum; done | sort -u | wc -l | tr -d ' ')
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


say "the harness gates fire, pass, and fail open (fixtures)"
FIX="scripts/fixtures"
mkrun() { # $1 = temp dir; creates an open run with an empty record
  mkdir -p "$1/.frends/runs"
  printf 'loop: build-loop\nrecord: runs/r.md\n' > "$1/.frends/current-run"
  : > "$1/.frends/runs/r.md"
}
stopgate() { node frends/hooks/stop-gate.js; }

d=$(mktemp -d)
# no run open: silent allow
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate)
[ -z "$out" ] || { echo "  stop-gate: expected silence with no run open"; fail=1; }

# success with mutate-then-validate evt lines: allow, ledger written, run closed
mkrun "$d"
printf 'evt · process_add_task · mutate · draft 7 · ok\nevt · validate_process · validate · draft 7 · errors: 0\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate)
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked a valid success"; fail=1; }
grep -q '\*\*success\*\*' "$d/.frends/ledger.md" || { echo "  stop-gate: no ledger line on success"; fail=1; }
[ -f "$d/.frends/current-run" ] && { echo "  stop-gate: run not closed on success"; fail=1; }
grep -q '^terminal state: success' "$d/.frends/runs/r.md" || { echo "  stop-gate: state line not persisted into the record"; fail=1; }
tail -1 "$d/.frends/ledger.md" | grep -qE "$(python3 -c 'import json;print(json.load(open("frends/hooks/formats.json"))["ledgerLineRe"])')" || { echo "  stop-gate: the ledger line does not match ledgerLineRe"; fail=1; }
grep -E "$(python3 -c 'import json;print(json.load(open("frends/hooks/formats.json"))["evtLineRe"])')" "$d/.frends/runs/r.md" | head -1 | grep -q evt || { echo "  record evt lines do not match evtLineRe"; fail=1; }

# a decorated state line (backticks, bold) still counts; the harness skill shows it backticked
mkrun "$d"
printf 'evt · process_add_task · mutate · draft 7 · ok\nevt · validate_process · validate · draft 7 · errors: 0\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"`terminal state: success`"}' "$d" | stopgate)
[ -f "$d/.frends/current-run" ] && { echo "  stop-gate: missed a backticked state line"; fail=1; }
mkrun "$d"
printf 'evt · validate_process · validate · draft 7 · errors: 0\nevt · process_add_task · mutate · draft 7 · ok\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"**terminal state: success**"}' "$d" | stopgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  stop-gate: a bolded state line escaped the block"; fail=1; }
rm "$d/.frends/current-run" 2>/dev/null || true

# the record-line example grammar holds (recordLineRe is load-bearing here)
echo 'turn 1 · dispatched the builder · validate_process draft 7: 0 errors · slices 2-4 remain' | grep -qE "$(python3 -c 'import json;print(json.load(open("frends/hooks/formats.json"))["recordLineRe"])')" || { echo "  the record grammar example does not match recordLineRe"; fail=1; }

# a state line that carries its evidence on the same line still counts
mkrun "$d"
printf 'evt · process_add_task · mutate · draft 7 · ok\nevt · validate_process · validate · draft 7 · errors: 0\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success · validate_process draft 7: 0 errors"}' "$d" | stopgate)
[ -f "$d/.frends/current-run" ] && { echo "  stop-gate: missed a state line with trailing evidence"; fail=1; }

# the state named only in prose, not on its own line: no state, no close, no block
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"I cannot claim terminal state: success yet."}' "$d" | stopgate)
[ -z "$out" ] || { echo "  stop-gate: acted on a prose mention of the state"; fail=1; }
[ -f "$d/.frends/current-run" ] || { echo "  stop-gate: closed a run on a prose mention"; fail=1; }

# per-draft order: draft 8 changed after draft 7 validated; success must block
mkrun "$d"
printf 'evt · validate_process · validate · draft 7 · errors: 0\nevt · process_add_task · mutate · draft 7 · ok\nevt · validate_process · validate · draft 7 · errors: 0\nevt · process_add_task · mutate · draft 8 · ok\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  stop-gate: missed the unvalidated second draft"; fail=1; }
echo "$out" | grep -q 'draft 8' || { echo "  stop-gate: block reason does not name the stale draft"; fail=1; }
rm "$d/.frends/current-run" 2>/dev/null || true

# success with validate-then-mutate evt lines: block, run stays open
mkrun "$d"
printf 'evt · validate_process · validate · draft 7 · errors: 0\nevt · process_add_task · mutate · draft 7 · ok\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  stop-gate: did not block an unvalidated success"; fail=1; }
echo "$out" | grep -q 'GATE RESULT ONLY' || { echo "  stop-gate: block reason lacks the banner"; fail=1; }
[ -f "$d/.frends/current-run" ] || { echo "  stop-gate: closed a blocked run"; fail=1; }

# the same claim with stop_hook_active true: never blocks twice, the run closes,
# and the still-contradicted close is marked unverified in ledger and record
out=$(printf '{"cwd":"%s","stop_hook_active":true,"last_assistant_message":"terminal state: success"}' "$d" | stopgate)
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked twice"; fail=1; }
[ -f "$d/.frends/current-run" ] && { echo "  stop-gate: run left open after the continuation stop"; fail=1; }
tail -1 "$d/.frends/ledger.md" | grep -q 'success · unverified' || { echo "  stop-gate: contradicted continuation close not marked unverified"; fail=1; }
grep -q '^gate: closed on the continuation stop' "$d/.frends/runs/r.md" || { echo "  stop-gate: no gate note in the record on the continuation close"; fail=1; }

# a non-success state closes the run honestly
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: blocked"}' "$d" | stopgate)
grep -q '\*\*blocked\*\*' "$d/.frends/ledger.md" || { echo "  stop-gate: no ledger line for blocked"; fail=1; }
[ -f "$d/.frends/current-run" ] && { echo "  stop-gate: run not closed on blocked"; fail=1; }

# transcript fallback, both orders (empty record)
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success","transcript_path":"%s"}' "$d" "$PWD/$FIX/transcript-mutate-then-validate.jsonl" | stopgate)
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked the good transcript order"; fail=1; }
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success","transcript_path":"%s"}' "$d" "$PWD/$FIX/transcript-validate-then-mutate.jsonl" | stopgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  stop-gate: missed the bad transcript order"; fail=1; }
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success","transcript_path":"%s"}' "$d" "$PWD/$FIX/transcript-validate-with-errors.jsonl" | stopgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  stop-gate: certified a validation that reported errors"; fail=1; }
rm "$d/.frends/current-run" 2>/dev/null || true

# missing transcript and empty record: allow with the named non-check
mkrun "$d"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success","transcript_path":"%s/absent.jsonl"}' "$d" "$d" | stopgate 2>&1)
echo "$out" | grep -q 'nothing was checked' || { echo "  stop-gate: missing evidence not named"; fail=1; }
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked with no evidence source"; fail=1; }
tail -1 "$d/.frends/ledger.md" | grep -q 'success · unverified' || { echo "  stop-gate: unevidenced close not marked unverified"; fail=1; }
tail -1 "$d/.frends/ledger.md" | grep -qE "$(python3 -c 'import json;print(json.load(open("frends/hooks/formats.json"))["ledgerLineRe"])')" || { echo "  stop-gate: the unverified ledger line does not match ledgerLineRe"; fail=1; }

# an auto-layout after the last validation does not reopen the check, by design
mkrun "$d"
printf 'evt · process_add_task · mutate · draft 7 · ok\nevt · validate_process · validate · draft 7 · errors: 0\nevt · process_auto_layout · layout · draft 7 · ok\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate)
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked a layout-after-validate success"; fail=1; }
tail -1 "$d/.frends/ledger.md" | grep -q 'unverified' && { echo "  stop-gate: layout close wrongly marked unverified"; fail=1; }

# garbage stdin: fail open
out=$(echo 'not json' | stopgate); [ -z "$out" ] || { echo "  stop-gate: noisy on garbage"; fail=1; }

# mutation: a corrupted formats.json must make the gate fail OPEN, proving the harness can fail
cp frends/hooks/formats.json "$d/formats.bak"
trap 'cp "$d/formats.bak" frends/hooks/formats.json 2>/dev/null || true' EXIT
echo 'broken' > frends/hooks/formats.json
mkrun "$d"
printf 'evt · validate_process · validate · draft 7 · errors: 0\nevt · process_add_task · mutate · draft 7 · ok\n' >> "$d/.frends/runs/r.md"
out=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate 2>/dev/null)
vout=$(printf '{"agent_type":"frends:draft-reviewer","last_assistant_message":"junk"}' | node frends/hooks/reviewer-verdict-gate.js 2>/dev/null)
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_expression","tool_input":{"draftId":7}}' "$d" | node frends/hooks/record-tool-event.js 2>/dev/null
nerr=$(printf '{"cwd":"%s","last_assistant_message":"terminal state: success"}' "$d" | stopgate 2>&1 >/dev/null)
mv "$d/formats.bak" frends/hooks/formats.json
trap - EXIT
echo "$out" | grep -q '"decision"' && { echo "  stop-gate: blocked while broken (must fail open)"; fail=1; }
echo "$vout" | grep -q '"decision"' && { echo "  verdict-gate: blocked while broken (must fail open)"; fail=1; }
grep -q 'evt · process_add_expression' "$d/.frends/runs/r.md" && { echo "  recorder: wrote while broken"; fail=1; }
echo "$nerr" | grep -q 'formats.json unreadable' || { echo "  stop-gate: broken gate did not say so"; fail=1; }

# a symlink inside .frends pointing outside it is treated as no run at all
mkrun "$d"
: > "$d/outside-target.md"
ln -s "$d/outside-target.md" "$d/.frends/runs/link.md"
printf 'loop: build-loop\nrecord: runs/link.md\n' > "$d/.frends/current-run"
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftId":7}}' "$d" | rec 2>/dev/null || true
[ -s "$d/outside-target.md" ] && { echo "  recorder: followed a symlink out of .frends"; fail=1; }
rm "$d/.frends/runs/link.md" "$d/.frends/current-run" 2>/dev/null || true

# a current-run pointer that escapes .frends is treated as no run at all
mkdir -p "$d/.frends"; printf 'loop: build-loop\nrecord: ../../escape.md\n' > "$d/.frends/current-run"
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftId":7}}' "$d" | node frends/hooks/record-tool-event.js
[ -e "$d/../../escape.md" ] && { echo "  recorder: followed a pointer out of .frends"; fail=1; }
[ -e "$d/escape.md" ] && { echo "  recorder: followed a pointer out of .frends (one level)"; fail=1; }
rm "$d/.frends/current-run"

say "the verdict gate bounces a malformed report once and passes a good one"
vgate() { node frends/hooks/reviewer-verdict-gate.js; }
json_msg() { python3 -c 'import json,sys; print(json.dumps({"agent_type":sys.argv[1],"last_assistant_message":open(sys.argv[2]).read()}))' "$1" "$2"; }
out=$(json_msg "frends:draft-reviewer" "$FIX/verdict-good.txt" | vgate)
[ -z "$out" ] || { echo "  verdict-gate: bounced a good verdict"; fail=1; }
out=$(json_msg "frends:draft-reviewer" "$FIX/verdict-missing-heading.txt" | vgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  verdict-gate: passed a verdict without Not verified"; fail=1; }
out=$(json_msg "frends:process-builder" "$FIX/builder-report-good.txt" | vgate)
[ -z "$out" ] || { echo "  verdict-gate: bounced a good builder report"; fail=1; }
out=$(printf '{"agent_type":"frends:draft-reviewer","stop_hook_active":true,"last_assistant_message":"junk"}' | vgate)
[ -z "$out" ] || { echo "  verdict-gate: blocked twice"; fail=1; }
out=$(printf '{"agent_type":"frends:unknown-agent","last_assistant_message":"junk"}' | vgate)
[ -z "$out" ] || { echo "  verdict-gate: noisy on an unmatched agent"; fail=1; }
inline=$(python3 -c 'import json;print(json.dumps({"agent_type":"frends:draft-reviewer","last_assistant_message":"the ## Findings: conventions heading and the ## Not verified part are discussed inline\nCount: 1 finding, worst: x"}))')
out=$(echo "$inline" | vgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  verdict-gate: accepted headings mentioned in prose"; fail=1; }
banana=$(python3 -c 'import json;print(json.dumps({"agent_type":"frends:draft-reviewer","last_assistant_message":"## Findings: banana\n- x\n\n## Not verified\nnothing\n\nCount: 1 finding, worst: x"}))')
out=$(echo "$banana" | vgate)
echo "$out" | grep -q '"decision":"block"' || { echo "  verdict-gate: accepted an invalid review axis"; fail=1; }

say "the recorder writes names and counts, never values, and only into an open run"
rec() { node frends/hooks/record-tool-event.js; }
mkrun "$d"
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftId":7,"parameters":{"apiKey":"SECRETVALUE"}}}' "$d" | rec
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__validate_process","tool_input":{"draftId":7},"tool_response":{"errors":[]}}' "$d" | rec
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__validate_process","tool_input":{"draftId":7},"tool_response":"unparseable"}' "$d" | rec
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__start_process","tool_input":{"deploymentId":9,"triggerParameters":{"k":"SECRETVALUE"}}}' "$d" | rec
grep -q 'SECRETVALUE' "$d/.frends/runs/r.md" && { echo "  recorder: wrote a value"; fail=1; }
grep -q 'evt · process_add_task · mutate · draft 7 · ok' "$d/.frends/runs/r.md" || { echo "  recorder: missing the mutate line"; fail=1; }
grep -q 'evt · validate_process · validate · draft 7 · errors: 0' "$d/.frends/runs/r.md" || { echo "  recorder: missing errors: 0"; fail=1; }
grep -q 'evt · validate_process · validate · draft 7 · not parsed' "$d/.frends/runs/r.md" || { echo "  recorder: missing not parsed"; fail=1; }
grep -q 'evt · start_process · leave-draft' "$d/.frends/runs/r.md" || { echo "  recorder: missing the leave-draft line"; fail=1; }
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftCredential":"SECRETVALUE2","draftId":7}}' "$d" | rec
grep -q 'SECRETVALUE2' "$d/.frends/runs/r.md" && { echo "  recorder: leaked a value from a draft-named key"; fail=1; }
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_auto_layout","tool_input":{"draftId":7}}' "$d" | rec
grep -q 'evt · process_auto_layout · layout · draft 7 · ok' "$d/.frends/runs/r.md" || { echo "  recorder: missing the layout line"; fail=1; }
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftId":"sk-live-c0ffee-SECRETVALUE3"}}' "$d" | rec
grep -q 'SECRETVALUE3' "$d/.frends/runs/r.md" && { echo "  recorder: wrote a secret-shaped draft id"; fail=1; }
d2=$(mktemp -d)
printf '{"cwd":"%s","tool_name":"mcp__plugin_frends_frends__process_add_task","tool_input":{"draftId":7}}' "$d2" | rec
[ -e "$d2/.frends" ] && { echo "  recorder: wrote without an open run"; fail=1; }
find "$d" "$d2" -depth -delete 2>/dev/null || true

say "hooks.json wires the gates as designed"
python3 - <<'PY' || fail=1
import json,sys
d=json.load(open("frends/hooks/hooks.json"))["hooks"]
assert "matcher" not in d["Stop"][0], "Stop must have no matcher"
assert d["SubagentStop"][0]["matcher"] == "^frends:(draft-reviewer|process-builder)$"
assert "record-tool-event" in d["PostToolUse"][0]["hooks"][0]["args"][0]
PY

say "the workflow and the hooks parse as Node scripts"
for f in frends/workflows/*.js frends/hooks/*.js; do
  node --check "$f" 2>/dev/null || { echo "  $f fails node --check"; fail=1; }
done
grep -qE 'Date\.now|Math\.random' frends/workflows/*.js && { echo "  workflow uses a banned nondeterministic call"; fail=1; }

say "the loop skills carry the full anatomy and the harness grammar"
STATES=$(python3 -c 'import json;print(" ".join(json.load(open("frends/hooks/formats.json"))["terminalStates"]))')
RECLIT=$(python3 -c 'import json;print(json.load(open("frends/hooks/formats.json"))["recordLineLiteral"])')
for f in frends/skills/build-loop/SKILL.md frends/skills/fix-loop/SKILL.md frends/skills/deliver-loop/SKILL.md; do
  for h in "## DONE when" "## ANTI-GAMING" "## TERMINAL STATES" "## SETUP" "## EVERY TURN" "## At DONE"; do
    [ "$(grep -cF "$h" "$f")" = "1" ] || { echo "  $f: heading '$h' not exactly once"; fail=1; }
  done
  for st in "success" "clean no-op" "blocked" "approval-required" "exhausted" "stagnated"; do
    echo "$STATES" | grep -qF "$st" || { echo "  formats.json lost state $st"; fail=1; }
    grep -qF "**$st**" "$f" || { echo "  $f: terminal state $st not defined"; fail=1; }
  done
  grep -qF "Hard cap:" "$f" || { echo "  $f: no hard cap"; fail=1; }
  grep -qF "$RECLIT" "$f" || { echo "  $f: record grammar literal missing"; fail=1; }
  grep -qF "RUBRIC FREEZE" "$f" || { echo "  $f: no rubric freeze"; fail=1; }
  grep -q 'harness` skill before turn 1' "$f" || { echo "  $f: does not read the harness skill first"; fail=1; }
  grep -qF "no open decisions this run" "$f" || { echo "  $f: no open-decisions contract"; fail=1; }
done

say "the agents preload the harness and the builder cannot leave the draft"
for a in process-builder draft-reviewer failure-diagnoser; do
  f="frends/agents/$a.md"
  [ -f "$f" ] || { echo "  $f missing"; fail=1; continue; }
  grep -qE '^  - harness$' "$f" || { echo "  $f: harness not preloaded"; fail=1; }
  grep -qE '^maxTurns: [0-9]+$' "$f" || { echo "  $f: no maxTurns"; fail=1; }
done
TOOLS_LINE=$(grep '^tools:' frends/agents/process-builder.md)
for gated in create_process_from_draft deploy_process start_process import_task create_environment_variable; do
  echo "$TOOLS_LINE" | grep -qF "__$gated" && { echo "  process-builder is granted the gated tool $gated"; fail=1; }
done
echo "$TOOLS_LINE" | grep -qE '(^|[ ,])Agent([ ,]|$)' && { echo "  process-builder can spawn agents"; fail=1; }
DIAG_LINE=$(grep '^tools:' frends/agents/failure-diagnoser.md)
echo "$DIAG_LINE" | grep -qE 'process_add|process_edit|process_remove|create_process_draft|process_set|process_batch' && { echo "  failure-diagnoser holds a mutating tool"; fail=1; }

say "no internal paths or private tooling in public files"
grep -rnE '/Users/|\.coord|claude-flow|Obsidian' frends README.md docs .out-of-scope CHANGELOG.md | grep -v '.claude-plugin' && fail=1

say "version and counts agree"
v=$(python3 -c 'import json;print(json.load(open("frends/.claude-plugin/plugin.json"))["version"])')
grep -q "^## $v" CHANGELOG.md || { echo "  CHANGELOG has no $v section"; fail=1; }
s=$(ls -d frends/skills/*/ | wc -l | tr -d ' ')
grep -qE "\b$s skills\b" README.md || { echo "  README does not say $s skills"; fail=1; }

echo "result: $([ $fail = 0 ] && echo clean || echo FINDINGS)"
exit $fail
