// Stop gate: when a loop run is open, a message that claims `terminal state: success`
// passes only if a validate_process call follows the last draft change. On any other
// terminal state the gate writes the ledger line and closes the run. Presence and
// order only; it never judges quality, and it never blocks twice in a row.
const { readStdin, loadFormats, openRun, bareTool, fs, path } = require("./_shared.js");

function allow(note) {
  if (note) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "Stop", additionalContext: note } }));
  }
  process.exit(0);
}

function evidenceFromRecord(text, F) {
  let lastMutate = -1, lastValidate = -1, i = 0, sawEvt = false;
  for (const line of text.split("\n")) {
    const m = line.match(/^evt · ([a-z_]+) · (mutate|validate|leave-draft) · /);
    if (!m) { continue; }
    sawEvt = true; i += 1;
    if (m[2] === "mutate") { lastMutate = i; }
    if (m[2] === "validate" && m[1] === F.validateTool && / · ok$| · errors: 0$/.test(line)) { lastValidate = i; }
  }
  return sawEvt ? { lastMutate, lastValidate } : null;
}

function evidenceFromTranscript(transcriptPath, F) {
  let lastMutate = -1, lastValidate = -1, i = 0, saw = false;
  let text;
  try { text = fs.readFileSync(transcriptPath, "utf8"); } catch (e) { return null; }
  const errored = new Set();
  const validates = [];
  for (const line of text.split("\n")) {
    let d; try { d = JSON.parse(line); } catch (e) { continue; }
    const content = d && d.message && Array.isArray(d.message.content) ? d.message.content : [];
    for (const b of content) {
      if (b && b.type === "tool_result" && b.is_error === true) { errored.add(b.tool_use_id); }
      if (b && b.type === "tool_use" && typeof b.name === "string" && b.name.indexOf("mcp__") === 0) {
        const t = bareTool(b.name);
        i += 1;
        if (new RegExp(F.mutationToolRe).test(t)) { saw = true; lastMutate = i; }
        if (t === F.validateTool) { saw = true; validates.push({ idx: i, id: b.id }); }
      }
    }
  }
  for (const v of validates) { if (!errored.has(v.id) && v.idx > lastValidate) { lastValidate = v.idx; } }
  return saw ? { lastMutate, lastValidate } : { lastMutate: -1, lastValidate: -1 };
}

readStdin((input) => {
  if (!input) { allow(); }
  const F = (() => { try { return loadFormats(); } catch (e) { return null; } })();
  if (!F) { allow(); }
  const run = openRun(input.cwd || process.cwd());
  if (!run) { allow(); }
  const msg = String(input.last_assistant_message || "");
  const stateMatch = msg.match(new RegExp(F.terminalStateRe, "i"));

  if (input.stop_hook_active === true) {
    allow(F.banner + " The validate-after-change gate does not block twice in one stop.");
  }

  if (stateMatch && stateMatch[1].toLowerCase() !== "success") {
    closeRun(run, stateMatch[1].toLowerCase());
    allow(F.banner + " Run closed as " + stateMatch[1] + "; the ledger line was written.");
  }

  if (!stateMatch) { allow(); }

  // terminal state: success, so demand the order.
  let ev = null;
  try { ev = evidenceFromRecord(fs.readFileSync(run.recordPath, "utf8"), F); } catch (e) { ev = null; }
  if (ev === null) { ev = evidenceFromTranscript(input.transcript_path, F); }
  if (ev === null) {
    closeRun(run, "success");
    allow(F.banner + " No evidence source was readable; nothing was checked.");
  }
  if (ev.lastMutate === -1 || ev.lastValidate > ev.lastMutate) {
    closeRun(run, "success");
    allow(F.banner + " A validate_process call follows the last draft change. Order was checked, not quality.");
  }
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: F.banner + " You wrote terminal state: success, but the last validate_process on record precedes the last change to the draft, or is missing. Run validate_process on the draft and quote its result, then state the terminal state again; or change the terminal state to the one the evidence supports.",
  }));
  process.exit(0);

  function closeRun(r, state) {
    try {
      const date = (fs.statSync(r.pointerPath).mtime || new Date()).toISOString().slice(0, 10);
      const rel = path.relative(path.join(path.dirname(r.pointerPath)), r.recordPath);
      const subject = path.basename(r.recordPath, ".md");
      fs.appendFileSync(path.join(path.dirname(r.pointerPath), "ledger.md"),
        "- " + date + " · " + r.loop + " · " + subject + " · **" + state + "** · " + rel + "\n");
      fs.unlinkSync(r.pointerPath);
    } catch (e) { /* fail open */ }
  }
});
