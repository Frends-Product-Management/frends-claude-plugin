export const meta = {
  name: 'deliver-an-integration',
  description: 'Build every Process in a confirmed integration plan to a validated draft, review each twice, and hand back a table. Promotion is never taken.',
  whenToUse: 'The non-interactive form of the deliver-loop skill: a confirmed plan in, per-Process validated and twice-reviewed drafts out. Pass the integration-planning build handoff block as args, with its own keys: confirmation_status, open_questions, processes (name, mode, trigger, steps, acceptance_criteria, out_of_scope). This workflow keeps no .frends/ run record; the table it returns is its evidence.',
  phases: [
    { title: 'Build', detail: 'one builder agent per planned Process' },
    { title: 'Snapshot', detail: 'an independent fetch of each draft structure' },
    { title: 'Review', detail: 'two reviewer verdicts per draft, conventions and plan' },
  ],
}

const BUILD_SCHEMA = {
  type: 'object',
  required: ['draftId', 'built', 'remaining', 'lastValidate'],
  properties: {
    draftId: { type: 'string' },
    built: { type: 'string' },
    remaining: { type: 'string' },
    lastValidate: {
      type: 'object',
      required: ['errors', 'afterLastChange'],
      properties: {
        errors: { type: 'integer' },
        afterLastChange: { type: 'boolean' },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['axis', 'findings', 'notVerified', 'worst'],
  properties: {
    axis: { type: 'string', enum: ['conventions', 'plan'] },
    findings: { type: 'array', items: { type: 'string' } },
    notVerified: { type: 'array', items: { type: 'string' } },
    worst: { type: 'string' },
  },
}

// args is the plan's own build handoff block, its keys as integration-planning writes them.
const plan = args || {}
if (plan.confirmation_status !== 'confirmed') {
  return { terminalState: 'blocked', reason: 'the plan is not confirmed; confirmation_status must be confirmed before any build starts' }
}
const blocking = (Array.isArray(plan.open_questions) ? plan.open_questions : []).filter((q) => q && q.blocking === true)
if (blocking.length > 0) {
  return { terminalState: 'blocked', reason: 'blocking open questions are unanswered: ' + blocking.map((q) => q.question).join('; ') }
}
const allProcesses = Array.isArray(plan.processes) ? plan.processes : []
const processes = allProcesses.slice(0, 6)
if (processes.length === 0) {
  return { terminalState: 'clean no-op', reason: 'the plan names no Process to build' }
}
if (allProcesses.length > 6) {
  log('the run caps at 6 Processes; ' + (allProcesses.length - 6) + ' left for the next run')
}

const rows = await pipeline(
  processes,
  (p, item) => agent(
    'Build ONE Frends Process draft for the plan entry below, following your own working rules. ' +
    'Stop at a validated draft; never promote, deploy, run, import a Task package or create an environment variable.\n\n' +
    'Plan entry (its acceptance_criteria are frozen; you may not edit them):\n' +
    JSON.stringify(item, null, 2) +
    (plan.error_policy ? '\n\nPlan error policy:\n' + JSON.stringify(plan.error_policy, null, 2) : '') +
    (plan.mappings ? '\n\nField mappings:\n' + JSON.stringify(plan.mappings, null, 2) : ''),
    { agentType: 'frends:process-builder', label: 'build:' + item.name, phase: 'Build', schema: BUILD_SCHEMA },
  ),
  async (build, item) => {
    if (!build) { return { name: item.name, state: 'blocked', reason: 'the builder returned nothing' } }
    if (build.lastValidate.errors !== 0 || !build.lastValidate.afterLastChange) {
      return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'validation not clean after the last change: ' + build.lastValidate.errors + ' errors', remaining: build.remaining }
    }
    // The reviewer reads only what it is handed, so an independent agent, not the
    // builder, fetches the frozen snapshot both verdicts are read from.
    const snapshot = await agent(
      'Fetch the structure of the Frends Process draft with id ' + build.draftId + ': use ToolSearch to load the ' +
      'mcp__plugin_frends_frends__process_get_structure tool, call it with that draft id, and return the full result ' +
      'verbatim, with no commentary and no summary. If the tool is not available, return exactly: SNAPSHOT UNAVAILABLE',
      { label: 'snapshot:' + item.name, phase: 'Snapshot' },
    )
    if (!snapshot || String(snapshot).indexOf('SNAPSHOT UNAVAILABLE') !== -1) {
      return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'no independent snapshot; the reviews did not run', built: build.built }
    }
    const briefs = [
      ['conventions', 'Review the draft snapshot below against Frends conventions.'],
      ['plan', 'Review the draft snapshot below against this plan entry.\n\nPlan entry:\n' + JSON.stringify(item, null, 2)],
    ]
    const verdicts = await parallel(briefs.map(([axis, brief]) => () =>
      agent(brief + '\nReview against these lenses; report findings only. Set axis to "' + axis + '".\n\nSnapshot:\n' + snapshot,
        { agentType: 'frends:draft-reviewer', label: 'review:' + axis + ':' + item.name, phase: 'Review', schema: VERDICT_SCHEMA })))
    const got = verdicts.filter(Boolean)
    if (got.length < 2) {
      return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'a reviewer returned nothing; the review is owed', built: build.built, verdicts: got }
    }
    return {
      name: item.name,
      state: 'approval-required',
      draftId: build.draftId,
      built: build.built,
      remaining: build.remaining,
      verdicts: got,
    }
  },
)

const table = rows.filter(Boolean)
const anyBlocked = table.some((r) => r.state !== 'approval-required') || table.length < processes.length
return {
  terminalState: anyBlocked ? 'blocked' : 'approval-required',
  promotion: 'not decided; the person decides',
  runRecord: 'none; this workflow keeps no .frends/ record, this table is its evidence',
  processes: table,
}
