// PreToolUse gate for the frends plugin: ask the person before a tool leaves the draft stage.
// Reads the hook input from stdin and answers with permissionDecision "ask". Never "deny":
// the person decides in the moment. Unreadable input still answers "ask".
const chunks = [];
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { input = {}; }
  const tool = String(input.tool_name || "").split("__").pop().slice(0, 60);
  const a = (input.tool_input && typeof input.tool_input === "object") ? input.tool_input : {};
  const r = (a.request && typeof a.request === "object") ? a.request : a;
  const show = (v) => (v === undefined || v === null || v === "" ? "?" : String(v).slice(0, 80));
  const names = (o) => (o && typeof o === "object") ? Object.keys(o).slice(0, 10).map((k) => k.slice(0, 40)).join(", ") : "";
  const reasons = {
    create_process_from_draft: () =>
      `Promote draft ${show(r.draftId)}${r.name ? ` as "${show(r.name)}"` : ""}. This compiles it, deploys the new version to the development Agent Group and consumes the draft. ` +
      (r.activate === true ? "Its triggers become active." : r.activate === false ? "Its triggers stay inactive." : "Activation is not set: a new Process stays inactive, an existing one keeps its current state."),
    deploy_process: () =>
      `Deploy deployment ${show(a.sourceDeploymentId)} to Agent Group ${show(a.targetAgentGroupId)}. ` +
      `Triggers ${a.activateTriggers === false ? "stay inactive" : "become active, which is the default when not set"}.`,
    start_process: () =>
      `Start deployment ${show(a.deploymentId)} now` +
      `${names(a.triggerParameters) ? ` with values for ${names(a.triggerParameters)}` : " with no parameters"}. This runs the Process for real.`,
    import_task: () =>
      `Import Task package ${show(a.packageId)}${a.packageVersion ? ` version ${show(a.packageVersion)}` : " at its latest version"} into the Tenant.`,
    create_environment_variable: () =>
      `Create environment variable ${show(a.groupName)}.${show(a.variableName)} (${show(a.type)}) with its Default value.`,
  };
  const reason = (reasons[tool] || (() => `Run ${tool || "this tool"}. This changes the Tenant.`))();
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: (reason + " The call and its arguments go to the tenant's audit log. Approve only if you asked for exactly this.").slice(0, 600),
    },
  }));
});
