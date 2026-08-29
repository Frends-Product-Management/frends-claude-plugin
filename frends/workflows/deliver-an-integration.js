export const meta = {
  name: 'deliver-an-integration',
  description: 'Build every Process in a confirmed integration plan to a validated draft, review each twice, and hand back a table. Promotion is never taken.',
  whenToUse: 'The non-interactive form of the deliver-loop skill: a confirmed plan in, per-Process validated and twice-reviewed drafts out. Pass the plan as args: { confirmationStatus, openQuestionsBlocking, processes: [{ name, planSection, criteria, patternReference }] }.',
  phases: [
    { title: 'Build', detail: 'one builder agent per planned Process' },
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

const plan = args || {}
if (plan.confirmationStatus !== 'confirmed') {
  return { terminalState: 'blocked', reason: 'the plan is not confirmed; run integration-planning to confirmation first' }
}
if (Array.isArray(plan.openQuestionsBlocking) && plan.openQuestionsBlocking.length > 0) {
  return { terminalState: 'blocked', reason: 'blocking open questions are unanswered: ' + plan.openQuestionsBlocking.join('; ') }
}
const processes = Array.isArray(plan.processes) ? plan.processes.slice(0, 6) : []
if (processes.length === 0) {
  return { terminalState: 'clean no-op', reason: 'the plan names no Process to build' }
}
if (Array.isArray(plan.processes) && plan.processes.length > 6) {
  log('the run caps at 6 Processes; ' + (plan.processes.length - 6) + ' left for the next run')
}

const rows = await pipeline(
  processes,
  (p, item, i) => agent(
    'Build ONE Frends Process draft for the plan section below, following your own working rules. ' +
    'Stop at a validated draft; never promote, deploy, run or import anything.\n\n' +
    'Process name: ' + item.name + '\n\nPlan section:\n' + item.planSection + '\n\n' +
    'Frozen acceptance criteria (you may not edit these):\n' + (item.criteria || 'none given; build to the plan section') + '\n\n' +
    'Pattern reference:\n' + (item.patternReference || 'none given; pick from the served process-authoring guide'),
    { agentType: 'frends:process-builder', label: 'build:' + item.name, phase: 'Build', schema: BUILD_SCHEMA },
  ),
  async (build, item) => {
    if (!build) { return { name: item.name, state: 'blocked', reason: 'the builder returned nothing' } }
    if (build.lastValidate.errors !== 0 || !build.lastValidate.afterLastChange) {
      return { name: item.name, state: 'blocked', draftId: build.draftId, reason: 'validation not clean after the last change: ' + build.lastValidate.errors + ' errors', remaining: build.remaining }
    }
    const briefs = [
      ['conventions', 'Review the draft with id ' + build.draftId + ' against Frends conventions. Read the snapshot yourself with your read tools.'],
      ['plan', 'Review the draft with id ' + build.draftId + ' against this plan section. Read the snapshot yourself with your read tools.\n\nPlan section:\n' + item.planSection],
    ]
    const verdicts = await parallel(briefs.map(([axis, brief]) => () =>
      agent(brief + '\nReview against these lenses; report findings only.',
        { agentType: 'frends:draft-reviewer', label: 'review:' + axis + ':' + item.name, phase: 'Review', schema: VERDICT_SCHEMA })))
    return {
      name: item.name,
      state: 'approval-required',
      draftId: build.draftId,
      built: build.built,
      remaining: build.remaining,
      verdicts: verdicts.filter(Boolean),
    }
  },
)

return {
  terminalState: 'approval-required',
  promotion: 'not decided; the person decides',
  processes: rows.filter(Boolean),
}
