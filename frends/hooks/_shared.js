// Shared helpers for the frends gate hooks. Every gate fails open on its own
// defects: a gate that blocks because it crashed is worse than no gate.
const fs = require("fs");
const path = require("path");

function readStdin(cb) {
  const chunks = [];
  process.stdin.on("data", (c) => chunks.push(c));
  process.stdin.on("end", () => {
    let input = null;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { input = null; }
    try { cb(input); } catch (e) { process.exit(0); }
  });
}

function loadFormats() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "formats.json"), "utf8"));
}

// The open run, or null. current-run has two lines: "loop: <name>" and "record: <relative path>".
function openRun(cwd) {
  try {
    const p = path.join(cwd, ".frends", "current-run");
    const text = fs.readFileSync(p, "utf8");
    const loop = (text.match(/^loop: (.+)$/m) || [])[1];
    const rec = (text.match(/^record: (.+)$/m) || [])[1];
    if (!loop || !rec) { return null; }
    return { loop: loop.trim(), recordPath: path.join(cwd, ".frends", rec.trim()), pointerPath: p };
  } catch (e) { return null; }
}

function bareTool(name) {
  return String(name || "").split("__").pop();
}

module.exports = { readStdin, loadFormats, openRun, bareTool, fs, path };
