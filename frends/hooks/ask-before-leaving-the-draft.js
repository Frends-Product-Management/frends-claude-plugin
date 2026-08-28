// PreToolUse gate for the frends plugin: ask the person before a tool leaves the draft stage.
// Reads the hook input from stdin and answers with permissionDecision "ask". Never "deny":
// the person decides in the moment. Unreadable input still answers "ask".
const chunks = [];
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { input = {}; }
  const tool = String(input.tool_name || "").split("__").pop();
  const a = input.tool_input || {};
  const r = a.request || a;
  const show = (v) => (v === undefined || v === null || v === "" ? "?" : String(v));
  const reasons = {
    create_process_from_draft: () =>
      `Promote draft ${show(r.draftId)}${r.name ? ` as "${r.name}"` : ""}. This compiles it and deploys it to the development Agent Group` +
      `${r.activate ? " and activates its trigger" : ""}.`,
    deploy_process: () =>
      `Deploy version ${show(a.sourceDeploymentId)} to Agent Group ${show(a.targetAgentGroupId)}. ` +
      `Triggers ${a.activateTriggers === false ? "stay inactive" : "become active (the default)"}.`,
    start_process: () =>
      `Start deployment ${show(a.deploymentId)} now` +
      `${a.triggerParameters && Object.keys(a.triggerParameters).length ? ` with values for ${Object.keys(a.triggerParameters).join(", ")}` : " with no parameters"}. ` +
      "This runs the Process for real, and the values go to the audit log.",
    import_task: () =>
      `Install Task package ${show(a.packageId)}${a.packageVersion ? ` version ${a.packageVersion}` : " (latest)"} into the Tenant.`,
    create_environment_variable: () =>
      `Create environment variable ${show(a.groupName)}.${show(a.variableName)} (${show(a.type)}). Its value is written to the Tenant and to the audit log.`,
  };
  const reason = (reasons[tool] || (() => `Run ${tool || "this tool"}. This changes the Tenant.`))();
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason + " Approve only if you asked for exactly this.",
    },
  }));
});
