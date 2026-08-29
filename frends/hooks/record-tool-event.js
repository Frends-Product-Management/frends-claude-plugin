// PostToolUse recorder: while a loop run is open, append one evt line per relevant
// tool call to the run record. Names, ids, classes and counts only, never values.
const { readStdin, loadFormats, openRun, bareTool, note, fs } = require("./_shared.js");

readStdin((input) => {
  if (!input) { process.exit(0); }
  let F; try { F = loadFormats(); } catch (e) { note("recorder", "formats.json unreadable; nothing was recorded."); process.exit(0); }
  const run = openRun(input.cwd || process.cwd());
  if (!run) { process.exit(0); }
  const t = bareTool(input.tool_name);
  let cls = null;
  if (t === F.validateTool) { cls = "validate"; }
  else if (new RegExp(F.mutationToolRe).test(t)) { cls = "mutate"; }
  else if (new RegExp(F.leaveDraftToolRe).test(t)) { cls = "leave-draft"; }
  else if (t === "process_auto_layout") { cls = "layout"; }
  if (!cls) { process.exit(0); }
  const a = (input.tool_input && typeof input.tool_input === "object") ? input.tool_input : {};
  const r = (a.request && typeof a.request === "object") ? a.request : a;
  // Only a key that IS the draft id, and only an id-shaped value; anything else
  // stays out of the record so a value can never ride in on a draft-named key.
  let draft = "?";
  for (const k of Object.keys(r)) {
    if (!/^(draft|draftid|processdraftid)$/i.test(k)) { continue; }
    const v = r[k];
    if ((typeof v === "string" || typeof v === "number") && /^[A-Za-z0-9-]{1,64}$/.test(String(v))) { draft = String(v); break; }
  }
  let result = "not parsed";
  if (cls === "validate") {
    try {
      let resp = input.tool_response;
      if (Array.isArray(resp)) { resp = resp.map((b) => (b && b.text) || "").join("\n"); }
      if (typeof resp === "string") { try { resp = JSON.parse(resp); } catch (e) { /* keep string */ } }
      if (typeof resp === "string") {
        const m = resp.match(/"[Ee]rrors"\s*:\s*\[([^\]]*)\]/);
        if (m) { result = "errors: " + (m[1].trim() === "" ? 0 : m[1].split("},").length); }
      } else if (resp && typeof resp === "object") {
        const errs = resp.errors || resp.Errors;
        if (Array.isArray(errs)) { result = "errors: " + errs.length; }
        else if (resp.isValid === true || resp.IsValid === true) { result = "errors: 0"; }
      }
    } catch (e) { result = "not parsed"; }
  } else {
    result = "ok";
  }
  try {
    fs.appendFileSync(run.recordPath, "evt · " + t.slice(0, 60) + " · " + cls + " · draft " + draft + " · " + result + "\n");
  } catch (e) { note("recorder", "the run record could not be written; this call is not on record."); }
  process.exit(0);
});
