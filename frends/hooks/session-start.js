// SessionStart: three lines of context. No routing table lives here; the skills route.
process.stdout.write([
  "Frends plugin: the Frends Platform MCP server serves its own guides through get_guide and list_guides, and those guides own the tool mechanics.",
  "A frends skill that names a guide fetches it with get_guide before acting; when get_guide fails or the guide is missing, call list_guides and say what is missing.",
  "Plugin safety boundaries still apply: build work stops at a validated draft, and promoting, deploying, running, importing a Task package or creating an environment variable is the person's decision.",
].join("\n"));
