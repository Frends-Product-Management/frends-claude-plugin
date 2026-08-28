# frends

## 0.6.0

### Minor Changes

- Route to the server's own guides instead of restating them. `build-a-process`, `find-and-inspect` and `diagnose-failures` now open by fetching the served guide that owns the mechanics (`process-authoring`, `search-processes`, `find-integration`, `explore-tasks`, `manage-environments`, `diagnose-process`) and keep only what no guide carries: the order to work in, where the work stops, and the checks validation cannot make.

  - Removed from `build-a-process` because the process-authoring guide owns them: the four draft modes, parameter modes and template interpolation, the reference-value table, the `#result` across a branch rule, `#var.error`, and the `#result.Body` reading shape.
  - Removed from `diagnose-failures` because the diagnose-process guide owns them: the instance and detail tool mechanics and the temporal patterns.
  - Removed from `find-and-inspect` because the guides own them: the `list_processes` shape lecture and the Task discovery mechanics.
  - The plugin states one boundary where it stops earlier than the guide continues: build work ends at the validated draft, and promoting, deploying and activating are the person's separate decision. It is written as a division of labour, not as a contradiction.

- Add a permission hook that asks the person before a tool call leaves the draft stage: `create_process_from_draft`, `deploy_process`, `start_process`, `import_task`, `create_environment_variable`. The prompt names the action and its effect, including that an unspecified `activateTriggers` means active, and shows parameter names but never values. It asks; it never denies.

- Add a session-start hook with three lines: the server serves its own guides, a skill that names a guide fetches it first, and the plugin's safety boundaries still apply. No routing table; the descriptions route.

- Add the `run-a-process` skill. Run, start and test intents had no owner; the build skill's description claimed them and its body said to stop. The new skill routes to the execute-process guide's confirmation protocol and adds what the guide does not say: a draft cannot run, a test has the same side effects as a real run, and the permission prompt is a backstop, not the approval.

- Add the `draft-reviewer` agent, read-only, dispatched twice by `review-a-draft` with one frozen snapshot of the draft and the fetched process-authoring guide, one brief per axis. When the session cannot run agents, the skill does both readings inline.

- `process-patterns`: each shape gets a reference file with its ordered shapes, the error handling seen in real Processes of that kind, and the usual mistakes, read out of two dozen exported Processes with every customer and system detail removed. Counts are stated as the evidence and its limit. The error-handling reality differs by shape: endpoints pass the upstream status through, MCP tools answer with a success status and put the outcome in the body, syncs treat a bad record as data, file exchanges checkpoint and wait.

- `review-a-draft`: the conventions axis now applies the served guide's pitfall list first and keeps only the plugin's own checks. Five items left because the guide owns them: result across a boundary, result on a catch path, invented parameter, statement in an expression shape, and "uncontained external call", which the exported sample also contradicts; error handling is now judged against the plan's failure section.

### Patch Changes

- `build-a-process` and `find-and-inspect` no longer create a draft in order to inspect a deployment. `get_process_data` reads a deployment; a fork is build work and needs the person to ask for it.
- `build-a-process`: the build loop has a floor. The same validation error after two different fixes ends the loop with a report instead of a third guess. A failed `process_batch_mutate` rolls the whole batch back, so recovery is a corrected batch, not a repair.
- `build-a-process` description no longer claims "run a Process for a test"; `getting-connected` and `diagnose-failures` descriptions now separate a connection that does not work from a run that failed; `process-patterns` is for requirements known and shape undecided, `integration-planning` for requirements still open.
- `getting-connected`: one sentence on the audit log, because every tool call's arguments are written there under the Private Application's name.
- README: the Codex section now claims Claude Code support and the verified Codex path only; the new gate section leads with the two ways the hook can be absent and the permission rule that survives them.
- Corrections found in review of this release, before it shipped: the interpolation rule and three run-time facts the served guides own were removed from `process-patterns`, its references and `run-a-process`; the build order no longer says a Process keeps exactly one trigger, since a Process may carry several of different kinds and at most one Manual Trigger; reviewing a deployed Process reads the definition from `get_process_data`, because the shape tools read drafts only; the hook's reasons now say that promotion consumes the draft, state the trigger outcome in every case, name the deployment rather than a version, and are capped in length; sample claims in the references lost their "every" and gained their limits; the release checks ship as `scripts/check.sh`.

## 0.5.0

### Minor Changes

- Add the `review-a-draft` skill. It reads a built Process draft and reports what is wrong with it on two axes that are never merged: Frends conventions, and the plan the draft came from.

  - The conventions axis deliberately skips anything `validate_process` already catches, so every finding is a fault that validates cleanly and fails later. Most of its items collect faults the other skills already document, such as a JSON body sent without its header, a result read across a branch boundary, and a result read on a catch path; two are judgements this skill adds, for an external call left uncontained and a shape nothing in the plan asked for.
  - The plan axis quotes the plan line or handoff key behind every finding, so a person can check the finding without trusting the review's reading of the plan.
  - The axes stay separate because either can pass while the other fails: an idiomatic draft can move the wrong fields, and a draft that carries out the plan exactly can break the first time a branch is taken.

- `getting-connected`: rebuild setup as a staged walkthrough, one stage per message, and stop asking for the token.

  - The Portal page and its click path now arrive before the question about the token, and the question is only whether it has been copied. The token's value never enters the conversation.
  - The operating system is asked before a command block is shown, instead of showing three blocks to everyone.
  - The five failure cases become a table ordered by the checks to run, so someone arriving with a symptom can enter there rather than reading the setup first.

- `integration-planning`: number the questions inside a topic, suggest an answer to those you have grounds to suggest one for, and let a question that depends on an unanswered one wait for the next message. Topics stay one per message.

  - The error-handling topic now asks two or three of its questions as stories, because a person who cannot answer a question about idempotency answers "what should happen if the same order arrives twice" immediately, and that answer is the requirement.
  - A rejected suggestion is recorded with the reason, so the next reader does not propose it again and make the customer explain twice.
  - The skill can now write a questionnaire for a question only an absent colleague can answer, one per owner, and take the filled questionnaire back as input to the plan.
  - The build handoff gains `mode`, `existing_process`, `current_behavior`, per-Process `acceptance_criteria` and per-Process `out_of_scope`. Whole-integration acceptance criteria could not tell a builder when the second of three Processes was done, and nothing recorded whether a Process was new or a new version of an existing one, which is the choice that cannot be undone after promotion.
  - The interview is now finished when a builder could work from the plan without coming back to the person, rather than when seven topics have been covered.

- `build-a-process`: plan the build order before building when the plan names several Processes.

  - A slice is one path from trigger to outcome ending at a clean validation, never a layer applied across the whole Process.
  - Preparation and shared building blocks are always blockers; a Manual Trigger comes first because it leaves the Process inert while it is built, and the real trigger is swapped in last.
  - Changing what a shared building block expects from its callers is handled in three stages instead of one edit, because every caller breaks at once otherwise.
  - The skill now offers a review of the finished draft against its plan, since validation proves only that the draft compiles.

- `diagnose-failures`: name three to five possible causes and rank them before testing any of them, and show the ranking to the user, who often re-ranks it in one sentence. The first plausible explanation is the one you will find evidence for if you go looking for it alone.

### Patch Changes

- Corrections found in review of this release, before it shipped:

  - `review-a-draft` now separates what reading a draft cannot settle. Anything that only appears in a run, including any acceptance criterion that needs one, is listed as not verified with what would settle it. A review with no findings said nothing about whether the draft works, and now says so.
  - `integration-planning` now marks each open question as blocking or not. A question with a named owner only counts as settled by delegation when the build can start without its answer; otherwise a plan could read as finished and still be unbuildable.
  - `build-a-process` no longer suggests a Manual Trigger makes each slice runnable. A draft cannot be run at all: the Manual Trigger is there because it leaves the Process inert while it is built, and because adding a live trigger early makes an endpoint or a schedule real as soon as the Process is deployed.
  - `getting-connected` now stops when it finds a working connection, instead of sending someone through a client restart they do not need.
  - `review-a-draft` now carries the limits on forking a deployed Process, and the fallback for a version that cannot be forked.
  - `.out-of-scope/no-autonomous-deployment.md` now says promotion deploys to the development Agent Group rather than to production, which is what the platform actually does.
  - The conventions list dropped its orphan-shape item after a check against the platform's own validation, which already reports a shape with no incoming connection. The list is for faults validation stays silent on, so an item validation catches does not belong on it.
  - The trigger item now says what is actually true: a second Manual Trigger is refused when you add it, and other trigger combinations are not, which is the case worth reviewing for.
  - The scope-creep item about work that was already promoted now accounts for promotion consuming the draft, so the reviewer meets it as a draft that has left the draft list rather than as a promoted draft still sitting there.
  - `getting-connected` asks Windows users whether they want the values kept for later, since the operating system alone does not choose between a session variable and a stored one, and it no longer claims a token is shown only once.

- Add `.out-of-scope/`, recording four decisions so each is made once and linked afterwards: no bundled setup executables, no credentials in files, no autonomous deployment, and no skill per Task or connected system.

- Remove every em-dash from the skills, the README and both manifests, replacing them with colons and semicolons.

## 0.4.0

### Minor Changes

- Add the `process-patterns` skill: six common Process shapes with when each fits, the trigger tool each needs, and the mistake each usually attracts.

- Every skill that calls tools now starts from the session's tool list rather than a hand-maintained list of tool names. A missing tool is reported as something this session does not expose, which is a different claim from the tenant lacking the capability, and building stops rather than degrades when `validate_process` is absent.

- `build-a-process`: carry the platform behaviour that validation cannot catch, including the four ways a draft can start, promotion being a deployment to the development Agent Group, reading a failure through `#var.error`, the silent Content-Type failure, and triggers activating by default on deployment.

- `integration-planning`: challenge a vague answer within the existing follow-up budget, offer rejectable suggestions for decisions only, look facts up in the tenant instead of asking, read the understanding back in plain language before writing, and synthesize a plan from a conversation that already happened. Plans are aligned with the Frends Integration Requirements Document.

### Patch Changes

- `getting-connected`: add the fifth failure case, where most tools work and one specific tool is missing because an API Policy does not target it.

- `find-and-inspect`: frame the draft fork as a way to inspect safely, name the leftover draft it creates, and show environment variable names without their values.

- README: correct the skill count, document the Codex path honestly (registering the server does not install the skills), and acknowledge the skills repository the interview patterns were adapted from.

## 0.3.0

### Minor Changes

- `integration-planning`: ask once whether a step should be built as a shared building block other integrations call, since a plan that assumes every step is built fresh overstates the work.

## 0.2.0

### Minor Changes

- Add the `integration-planning` skill: interview one topic at a time across seven topics, then write a plan with a fixed set of headings and a structured handoff a build step can read.

## 0.1.0

### Minor Changes

- First release: the tenant connector plus four skills for getting connected, finding and inspecting Processes, diagnosing failed runs, and building a draft up to a passing validation.
