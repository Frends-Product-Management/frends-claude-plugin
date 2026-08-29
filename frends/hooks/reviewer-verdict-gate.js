// SubagentStop gate for the loop agents: a verdict or build report missing its
// required parts is sent back once for re-issue. Presence and format only. It
// follows the agents wherever they run, loop or not, because their report
// contracts are unconditional; an empty text (a structured-output dispatch)
// passes untouched.
const { readStdin, loadFormats, note, fs } = require("./_shared.js");

function lastAssistantText(input) {
  if (typeof input.last_assistant_message === "string" && input.last_assistant_message) {
    return input.last_assistant_message;
  }
  try {
    const text = fs.readFileSync(input.agent_transcript_path, "utf8");
    let out = "";
    for (const line of text.split("\n")) {
      let d; try { d = JSON.parse(line); } catch (e) { continue; }
      if (d && d.type === "assistant" && d.message && Array.isArray(d.message.content)) {
        const t = d.message.content.filter((b) => b && b.type === "text").map((b) => b.text).join("\n");
        if (t) { out = t; }
      }
    }
    return out;
  } catch (e) { return ""; }
}

readStdin("verdict gate", (input) => {
  if (!input || input.stop_hook_active === true) { process.exit(0); }
  let F; try { F = loadFormats(); } catch (e) { note("verdict gate", "formats.json unreadable; nothing was checked."); process.exit(0); }
  const contract = (F.verdicts || {})[String(input.agent_type || "")];
  if (!contract) { process.exit(0); }
  const text = lastAssistantText(input);
  if (!text) { process.exit(0); }
  // Headings must sit at the start of their own line; a heading mentioned in
  // prose is not a section.
  const missing = contract.headingsRe.filter((h) => !new RegExp(h, "m").test(text));
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const lastLine = lines.length ? lines[lines.length - 1] : "";
  const lastOk = new RegExp(contract.lastLineRe).test(lastLine);
  if (missing.length === 0 && lastOk) { process.exit(0); }
  const what = missing.length ? "Missing section(s): " + missing.join(", ") + ". " : "The final line does not match. ";
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: F.banner + " " + what + contract.reissue,
  }));
  process.exit(0);
});
