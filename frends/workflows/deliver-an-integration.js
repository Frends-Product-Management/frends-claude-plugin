export const meta = {
  name: 'deliver-an-integration',
  description: 'Build every Process in a confirmed integration plan to a validated draft, review each twice, rebuild once on findings, and hand back a table. Promotion is never taken.',
  whenToUse: 'The non-interactive form of the deliver-loop skill: a confirmed plan in, per-Process validated and twice-reviewed drafts out. Pass the integration-planning build handoff block as args, with its own keys: confirmation_status, open_questions, processes, source, target, mappings, error_policy, credentials_needed, schedule_or_volume. This workflow keeps no .frends/ run record; the table it returns is its evidence.',
  phases: [
    { title: 'Build', detail: 'one builder agent per planned Process, one rebuild round on findings' },
    { title: 'Snapshot', detail: 'an independent fetch of each draft structure and shape configurations' },
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

// What every builder dispatch needs beyond its own Process entry. Credential
// entries are names only, by the plan's own rule.
const planContext = JSON.stringify({
  source: plan.source, target: plan.target, mappings: plan.mappings,
  error_policy: plan.error_policy, credentials_needed: plan.credentials_needed,
  schedule_or_volume: plan.schedule_or_volume,
}, null, 2)

function builderBrief(item, findings, draftId) {
  return 'Build ONE Frends Process draft for the plan entry below, following your own working rules. ' +
    'Stop at a validated draft; never promote, deploy, run, import a Task package or create an environment variable.\n\n' +
    'Plan entry (its acceptance_criteria are frozen; you may not edit them):\n' + JSON.stringify(item, null, 2) +
    '\n\nPlan context (source, target, mappings, error policy, credential names, volume):\n' + planContext +
    (draftId ? '\n\nRebuild INSIDE the existing draft with id ' + draftId + '; do not create a new draft.' : '') +
    (findings ? '\n\nA reviewer returned these findings on that draft; address each in the draft or name it in ## Remaining, verbatim:\n' + findings : '')
}

async function snapshotOf(draftId, name) {
  const snap = await agent(
    'Fetch a review snapshot of the Frends Process draft with id ' + draftId + ': use ToolSearch to load ' +
    'mcp__plugin_frends_frends__process_get_structure and mcp__plugin_frends_frends__process_get_shape_config, call ' +
    'process_get_structure with that draft id, then process_get_shape_config for each shape it lists. Return everything ' +
    'verbatim, with no commentary and no summary. If the tools are not available, return exactly: SNAPSHOT UNAVAILABLE',
    { label: 'snapshot:' + name, phase: 'Snapshot' },
  )
  if (!snap || String(snap).indexOf('SNAPSHOT UNAVAILABLE') !== -1) { return null }
  return String(snap)
}

// Two verdicts, one per axis; a run is only clean when both axes came back.
async function reviewOf(item, snapshot) {
  const briefs = [
    ['conventions', 'Fetch the served process-authoring guide with get_guide first and review the draft snapshot below against Frends conventions and the guide\u0027s pitfalls.'],
    ['plan', 'Review the draft snapshot below against this plan entry and its context.\n\nPlan entry:\n' + JSON.stringify(item, null, 2) + '\n\nPlan context:\n' + planContext],
  ]
  const verdicts = await parallel(briefs.map(([axis, brief]) => () =>
    agent(brief + '\nReview against these lenses; report findings only. Set axis to "' + axis + '".\n\nSnapshot:\n' + snapshot,
      { agentType: 'frends:draft-reviewer', label: 'review:' + axis + ':' + item.name, phase: 'Review', schema: VERDICT_SCHEMA })))
  const got = verdicts.filter(Boolean)
  const axes = got.map((v) => v.axis)
  if (axes.indexOf('conventions') === -1 || axes.indexOf('plan') === -1) { return null }
  return got
}

const rows = await pipeline(
  processes,
  (p, item) => agent(builderBrief(item, null),
    { agentType: 'frends:process-builder', label: 'build:' + item.name, phase: 'Build', schema: BUILD_SCHEMA }),
  async (build, item) => {
    if (!build) { return { name: item.name, state: 'blocked', reason: 'the builder returned nothing' } }
    if (build.lastValidate.errors !== 0 || !build.lastValidate.afterLastChange) {
      return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'validation not clean after the last change: ' + build.lastValidate.errors + ' errors', remaining: build.remaining }
    }
    // The reviewer reads only what it is handed, so an independent agent, not the
    // builder, fetches the frozen snapshot both verdicts are read from.
    let snapshot = await snapshotOf(build.draftId, item.name)
    if (!snapshot) { return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'no independent snapshot; the reviews did not run', built: build.built } }
    let verdicts = await reviewOf(item, snapshot)
    if (!verdicts) { return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'the two review axes did not both come back; the review is owed', built: build.built } }

    // One rebuild round: findings go back to the builder verbatim, then a fresh
    // snapshot and a fresh pair of verdicts. Findings that survive it are the
    // person's to judge; the workflow never decides they do not matter.
    const openFindings = (vs) => vs.flatMap((v) => (v.findings || []).map((f) => '[' + v.axis + '] ' + f))
    let findings = openFindings(verdicts)
    let rounds = 1
    if (findings.length > 0) {
      const rebuilt = await agent(builderBrief(item, findings.join('\n'), build.draftId),
        { agentType: 'frends:process-builder', label: 'rebuild:' + item.name, phase: 'Build', schema: BUILD_SCHEMA })
      rounds = 2
      if (!rebuilt || rebuilt.lastValidate.errors !== 0 || !rebuilt.lastValidate.afterLastChange) {
        return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'the rebuild round did not end in a clean validation', findings: findings, verdicts: verdicts }
      }
      if (rebuilt.draftId !== build.draftId) {
        return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'the rebuild came back in a different draft (' + rebuilt.draftId + '); the reviewed draft was ' + build.draftId, findings: findings }
      }
      snapshot = await snapshotOf(rebuilt.draftId, item.name)
      if (!snapshot) { return { name: item.name, state: 'blocked', draftId: rebuilt.draftId, reason: 'no independent snapshot after the rebuild; the re-review did not run', findings: findings } }
      verdicts = await reviewOf(item, snapshot)
      if (!verdicts) { return { name: item.name, state: 'blocked', draftId: rebuilt.draftId, reason: 'the two review axes did not both come back after the rebuild; the review is owed' } }
      build = rebuilt
      findings = openFindings(verdicts)
    }
    if (findings.length > 0) {
      return { name: item.name, state: 'exhausted', draftId: build.draftId, built: build.built, remaining: build.remaining, rounds: rounds, reason: 'findings remain after the rebuild round; the deliver-loop skill or the person decides', findings: findings, verdicts: verdicts }
    }
    return { name: item.name, state: 'approval-required', draftId: build.draftId, built: build.built, remaining: build.remaining, rounds: rounds, verdicts: verdicts }
  },
)

const table = rows.filter(Boolean)
const clean = table.length === processes.length && table.every((r) => r.state === 'approval-required')
const anyBlocked = table.length < processes.length || table.some((r) => r.state === 'blocked')
return {
  terminalState: clean ? 'approval-required' : (anyBlocked ? 'blocked' : 'exhausted'),
  reason: clean ? 'every draft validated with no open finding; promotion is the next decision' : (anyBlocked ? 'not every Process reached a clean, twice-reviewed draft; the per-Process states say what remains' : 'findings survived the rebuild round on at least one Process; the per-Process rows carry them'),
  promotion: 'not decided; the person decides',
  runRecord: 'none; this workflow keeps no .frends/ record, this table is its evidence',
  processes: table,
}
