// SessionStart: three lines of context. No routing table lives here; the skills route.
process.stdout.write([
  "Frends plugin: the Frends Platform MCP server serves its own guides through get_guide and list_guides, and those guides own the tool mechanics.",
  "A frends skill that names a guide fetches it with get_guide before acting; when get_guide fails or the guide is missing, call list_guides and say what is missing.",
  "Plugin safety boundaries still apply: build work stops at a validated draft, and promoting, deploying, running, importing a Task package or creating an environment variable is the person's decision.",
]
  .concat((() => {
    // The pointer is project content: resolve it through the contained openRun and
    // echo only a safe-charset relative path, never the raw file text.
    try {
      const { openRun, path } = require("./_shared.js");
      const run = openRun(process.cwd());
      if (!run) { return []; }
      const rel = path.relative(run.basePath, run.recordPath).split(path.sep).join("/");
      if (!/^[A-Za-z0-9._/-]{1,120}$/.test(rel)) { return []; }
      return ["A frends loop run is open at .frends/" + rel + "; read it before continuing."];
    } catch (e) { return []; }
  })())
  .join("\n"));
