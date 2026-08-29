// Shared helpers for the frends gate hooks. Every gate fails open on its own
// defects: a gate that blocks because it crashed is worse than no gate. When a
// gate cannot run its check, it says so on stderr rather than failing silently.
const fs = require("fs");
const path = require("path");

function readStdin(gate, cb) {
  const chunks = [];
  process.stdin.on("data", (c) => chunks.push(c));
  process.stdin.on("end", () => {
    let input = null;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { input = null; }
    try { cb(input); } catch (e) { note(gate, "crashed on its own defect; nothing was checked."); process.exit(0); }
  });
}

function loadFormats() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "formats.json"), "utf8"));
}

function note(gate, msg) {
  try { process.stderr.write("frends " + gate + ": " + msg + "\n"); } catch (e) { /* stderr gone */ }
}

// The open run, or null. current-run has two lines: "loop: <name>" and
// "record: <relative path>". The record must resolve INSIDE .frends; a pointer
// that escapes the directory is treated as no run, so a crafted pointer cannot
// make a hook append to an arbitrary file.
function openRun(cwd) {
  try {
    const base = path.resolve(cwd, ".frends");
    const p = path.join(base, "current-run");
    const text = fs.readFileSync(p, "utf8");
    const loop = (text.match(/^loop: (.+)$/m) || [])[1];
    const rec = (text.match(/^record: (.+)$/m) || [])[1];
    if (!loop || !rec) { return null; }
    const recordPath = path.resolve(base, rec.trim());
    if (recordPath !== base && recordPath.indexOf(base + path.sep) !== 0) { return null; }
    // Lexical containment is not enough: a symlink inside .frends could still
    // point outside it, so the real paths must agree too.
    let realBase = base; try { realBase = fs.realpathSync(base); } catch (e) { /* keep lexical */ }
    let realRecord;
    try { realRecord = fs.realpathSync(recordPath); }
    catch (e) {
      // The record may not exist yet; resolve its parent instead, so a
      // symlinked directory cannot host the file's creation outside .frends.
      try { realRecord = path.join(fs.realpathSync(path.dirname(recordPath)), path.basename(recordPath)); }
      catch (e2) { realRecord = recordPath; /* parent missing: no append can create it */ }
    }
    if (realRecord !== realBase && realRecord.indexOf(realBase + path.sep) !== 0) { return null; }
    return { loop: loop.trim(), recordPath: recordPath, pointerPath: p, basePath: base };
  } catch (e) { return null; }
}

function bareTool(name) {
  return String(name || "").split("__").pop();
}

module.exports = { readStdin, loadFormats, openRun, bareTool, note, fs, path };
