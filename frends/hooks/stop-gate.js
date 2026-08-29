// Stop gate: when a loop run is open, a message whose terminal-state line claims
// success passes only if a validate_process call follows the last change to each
// draft that was changed. On any other terminal state the gate closes the run and
// writes the ledger line. Presence and order only; it never judges quality, and
// it never blocks twice in one stop.
const { readStdin, loadFormats, openRun, bareTool, note, fs, path } = require("./_shared.js");

// evt lines from the run record, grouped per draft id. A validate qualifies
// unless it reports a nonzero error count: the order is the gate's claim, the
// count is the reviewer's.
function evidenceFromRecord(text, F) {
  const drafts = {}; let i = 0; let saw = false;
  const evtRe = new RegExp(F.evtLineRe);
  for (const line of text.split("\n")) {
    const m = line.match(evtRe);
    if (!m) { continue; }
    saw = true; i += 1;
    const id = m[3].trim();
    const d = drafts[id] || (drafts[id] = { lastMutate: -1, lastValidate: -1 });
    if (m[2] === "mutate") { d.lastMutate = i; }
    if (m[2] === "validate" && m[1] === F.validateTool && !/errors: [1-9]/.test(m[4])) { markValidate(drafts, id, i); }
  }
  return saw ? drafts : null;
}

// A validate with a known id vouches for that draft and for the unattributed
// bucket; one with an unknown id vouches for every draft. Blocking on an
// attribution gap the recorder could not close would be the gate failing
// closed, and the reviewer criteria still read the record behind it.
function markValidate(drafts, id, i) {
  if (id === "?") {
    for (const k of Object.keys(drafts)) { drafts[k].lastValidate = i; }
    const d = drafts["?"] || (drafts["?"] = { lastMutate: -1, lastValidate: -1 });
    d.lastValidate = i;
    return;
  }
  const d = drafts[id] || (drafts[id] = { lastMutate: -1, lastValidate: -1 });
  d.lastValidate = i;
  if (drafts["?"]) { drafts["?"].lastValidate = i; }
}

function draftIdFrom(inputObj) {
  const r = (inputObj && typeof inputObj === "object" && inputObj.request && typeof inputObj.request === "object") ? inputObj.request : (inputObj || {});
  for (const k of Object.keys(r)) {
    if (!/^(draft|draftid|processdraftid)$/i.test(k)) { continue; }
    const v = r[k];
    if ((typeof v === "string" || typeof v === "number") && /^([0-9]{1,12}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/.test(String(v))) { return String(v); }
  }
  return "?";
}

// Transcript fallback: same per-draft ordering from the session transcript. A
// validate whose result errored, or whose result text says isValid false, does
// not qualify; an unreadable result still counts for order, never for quality.
function evidenceFromTranscript(transcriptPath, F) {
  let text;
  try { text = fs.readFileSync(transcriptPath, "utf8"); } catch (e) { return null; }
  const results = {}; // tool_use_id -> { errored, text }
  const uses = [];
  for (const line of text.split("\n")) {
    let d; try { d = JSON.parse(line); } catch (e) { continue; }
    const content = d && d.message && Array.isArray(d.message.content) ? d.message.content : [];
    for (const b of content) {
      if (b && b.type === "tool_result") {
        let rt = "";
        if (typeof b.content === "string") { rt = b.content; }
        else if (Array.isArray(b.content)) { rt = b.content.map((x) => (x && x.text) || "").join("\n"); }
        results[b.tool_use_id] = { errored: b.is_error === true, text: rt };
      }
      if (b && b.type === "tool_use" && typeof b.name === "string" && b.name.indexOf("mcp__") === 0) {
        uses.push({ tool: bareTool(b.name), id: b.id, draft: draftIdFrom(b.input) });
      }
    }
  }
  const drafts = {}; let i = 0; let saw = false;
  for (const u of uses) {
    const isMutate = new RegExp(F.mutationToolRe).test(u.tool);
    const isValidate = u.tool === F.validateTool;
    if (!isMutate && !isValidate) { continue; }
    saw = true; i += 1;
    if (isMutate) {
      const d = drafts[u.draft] || (drafts[u.draft] = { lastMutate: -1, lastValidate: -1 });
      d.lastMutate = i;
    }
    if (isValidate) {
      const r = results[u.id];
      const failed = r && (r.errored || /"isValid"\s*:\s*false/i.test(r.text) || /"[Ee]rrors"\s*:\s*\[\s*[^\]\s]/.test(r.text));
      if (!failed) { markValidate(drafts, u.draft, i); }
    }
  }
  return saw ? drafts : null;
}

// Draft ids whose last change has no qualifying validate after it.
function unvalidated(drafts) {
  return Object.keys(drafts).filter((id) => drafts[id].lastMutate > -1 && drafts[id].lastValidate < drafts[id].lastMutate);
}

readStdin("stop gate", (input) => {
  if (!input) { process.exit(0); }
  let F;
  try { F = loadFormats(); } catch (e) { note("stop gate", "formats.json unreadable; nothing was checked."); process.exit(0); }
  const run = openRun(input.cwd || process.cwd());
  if (!run) { process.exit(0); }
  const msg = String(input.last_assistant_message || "");
  const re = new RegExp(F.terminalStateRe, "gim");
  let m, last = null;
  while ((m = re.exec(msg)) !== null) { last = m; }
  const state = last ? last[1].toLowerCase() : null;

  if (input.stop_hook_active === true) {
    // The gate had its one block and never blocks twice. Close under the claimed
    // state, and when a success claim is still contradicted by the record, write
    // that into the record first so the ledger line does not stand alone.
    if (state) {
      if (state === "success") {
        let d2 = null;
        try { d2 = evidenceFromRecord(fs.readFileSync(run.recordPath, "utf8"), F); } catch (e) { d2 = null; }
        if (d2 === null || unvalidated(d2).length > 0) {
          try { fs.appendFileSync(run.recordPath, "gate: closed on the continuation stop; the record does not show a validate_process after the last change\n"); } catch (e) { /* record gone */ }
          closeRun(run, state, true);
          process.exit(0);
        }
      }
      closeRun(run, state);
    }
    process.exit(0);
  }
  if (!state) { process.exit(0); }
  if (state !== "success") { closeRun(run, state); process.exit(0); }

  let drafts = null;
  try { drafts = evidenceFromRecord(fs.readFileSync(run.recordPath, "utf8"), F); } catch (e) { drafts = null; }
  if (drafts === null) { drafts = evidenceFromTranscript(input.transcript_path, F); }
  if (drafts === null) {
    note("stop gate", "no evidence source was readable; nothing was checked.");
    closeRun(run, "success", true);
    process.exit(0);
  }
  const stale = unvalidated(drafts);
  if (stale.length === 0) { closeRun(run, "success"); process.exit(0); }
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: F.banner + " You wrote terminal state: success, but the last validate_process on record precedes the last change" + (stale[0] === "?" ? "" : " to draft " + stale.join(", ")) + ", or is missing. Run validate_process on the changed draft and quote its result, then state the terminal state again; or change the terminal state to the one the evidence supports.",
  }));
  process.exit(0);

  // unverified marks a close the gate could not vouch for: the claimed state is
  // kept, and the ledger says the evidence never confirmed it.
  function closeRun(r, st, unverified) {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const rel = path.relative(r.basePath, r.recordPath);
      const subject = path.basename(r.recordPath, ".md");
      const mark = unverified ? st + " · unverified" : st;
      try { fs.appendFileSync(r.recordPath, "terminal state: " + st + (unverified ? " (unverified by the gate)" : "") + "\n"); } catch (e) { /* record gone */ }
      fs.appendFileSync(path.join(r.basePath, "ledger.md"),
        "- " + date + " · " + r.loop + " · " + subject + " · **" + mark + "** · " + rel + "\n");
      fs.unlinkSync(r.pointerPath);
    } catch (e) { note("stop gate", "the run could not be closed cleanly; check .frends/current-run yourself."); }
  }
});
