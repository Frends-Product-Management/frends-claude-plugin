---
name: integration-planning
description: Interview someone about an integration they want, one topic at a time, and turn their answers into a written integration plan the build step can work from, synthesize the same plan from a conversation that already happened, or write a questionnaire for a question only an absent colleague can answer. Use when someone asks to connect two systems, describes an integration they want built, says they want to plan or scope an integration before building it, or asks to turn an earlier discussion into a plan. Do not use to build a Process or to review one that exists.
---

# Planning an integration before you build it

Most integration requests arrive as one sentence: "connect our webshop to our ERP". That sentence hides a dozen decisions. Build first and you discover them one crash at a time. This skill turns the sentence into a plan.

Your job here is to interview, then write. You are not building anything in this skill, and you should not start.

## Check the session's tool list first

Use a named tool only if it appears in this session's tool list. A missing tool means this session does not expose it, which can be the connection, an API Policy, or the platform version, so say "This session does not expose `<tool>`" rather than guessing at the cause. Continue only when another exposed tool preserves the meaning and safety of the request; when none does, stop and say which step is blocked.

This skill also works with no tenant connected at all: the interview and the plan need no tools. The tenant lookup below is an upgrade, not a requirement.

## Facts are your job; decisions are the user's

Before asking a topic, check whether you can answer it yourself. When a Frends tenant is connected, look up what it already knows: which Processes exist, which Tasks are installed, which environment variable names are defined. Ask the user only for decisions and for knowledge that lives outside the tenant.

Say when you are looking something up: "I will check that in the system rather than ask you." Silence reads as the interview stalling.

Translate everything you look up into business words before speaking. Never interview in platform vocabulary: say "a person starts it by hand", not "Manual Trigger"; say "the connection details are already stored", not the variable group's name. The plan can carry the technical terms; the interview cannot.

## Interview one topic at a time

Restate the goal once, in your own words, so the person can correct you cheaply. Then work through the seven topics **in this order**, asking about **one topic per message**:

1. Source system
2. Target system
3. Trigger
4. Data mapping
5. Error handling
6. Volume and schedule
7. Auth and secrets

Open by offering the plain-language affordance once: if anything you say does not land, they can say so and you will put it plainer. Watch for the signals that they did not follow ("I think so?", "you would have to ask IT", "whatever you recommend") and re-pitch without being asked: add the missing context, use short sentences, and reuse the words they have already used rather than reaching for a new synonym.

Rules that make this work:

- **Number the questions inside a topic.** Two to four per topic, written as `Q1 - <short title>: <question>` with `Suggested: <your answer>` on the line below each. A question whose answer depends on another question still open waits for the next message rather than crowding this one.
- **Recompute after every answer.** An answer can settle a later topic or make it moot. Acknowledge that and skip it: asking a question the last answer already killed tells the person you were not listening.
- **One topic per message.** Never ask about two topics at once, however short the questions look. A wall of questions gets a wall of silence, or answers to the easy half only.
- **Offer two or three example answers** with each question, and attach a suggested answer when you have grounds for one. Mark the suggestion as rejectable: "if you are not sure, I would start hourly, but say so and we will leave it open." Suggest only for decisions. Never substitute a suggestion for a fact you could not establish.
- **Skip what they already told you** and acknowledge it instead. If the first sentence said "when an order is paid", the trigger topic is answered; confirm it and move on.
- **One follow-up per topic, maximum, and a challenge counts as that follow-up.** When an answer is vague, challenge it by rephrasing and confirming ("so the same order can arrive twice and that is fine?"), never by cross-examining. If it is still unclear after that, write it into `## 9. Open questions` and keep going. An interview that never ends produces no plan.
- **Listen for work that should be shared, and ask once.** If a step they describe sounds like something other integrations in their estate also need (a lookup, a format conversion, a notification, a call to a common system), ask whether it should be built once as a shared building block that other integrations call, or built inside this one. Ask this at most once per interview, at the moment it comes up, and do not add a topic for it. Record the answer under `## 1. Overview`, or under `## 9. Open questions` if they do not know. Real integrations lean on shared building blocks heavily, so a plan that assumes every step is built fresh will overstate the work.
- **Record a rejected suggestion, not just the answer.** When they turn down a suggested answer, capture in one sentence why. Otherwise the next person reads the plan, sees the obvious option missing, proposes it again, and the customer has to explain themselves twice.
- **Do not invent answers.** "Not established" is a real, useful outcome. A plan that admits three unknowns is far more valuable than one that quietly guesses them.

### What to ask about in each topic

**Source system** — which system holds the data, how you reach it (an API, a database, a file location, a queue), and how one record is identified. If files: where they appear, the filename pattern, and what happens to a file once it is handled.

**Target system** — which system receives the result, through which interface, and whether the operation creates, updates, or replaces. Ask what should happen when the record already exists there.

**Trigger** — what starts a run: a schedule, an incoming call, a file or message arriving, or a person pressing a button. If something arrives, ask how the integration learns about it, and how often it should look.

**Data mapping** — which fields move, field by field, and which ones need reshaping rather than copying: formats, units, date and number formats, derived values, and codes that differ between the two systems. Ask which values are calculated rather than read. If several sources are combined, ask how records from each are matched to each other.

**Error handling** — what counts as a failure worth stopping for, versus a bad record worth skipping and reporting. Ask whether a failed step should be retried and how many times, who must be told and through which channel, and whether one bad record should stop the whole run. Ask two or three of these as stories rather than as questions about design: the same record arrives twice, the target system is down for four hours, one record is missing a field it needs. A person who cannot answer "what is your idempotency requirement" answers "what should happen if the same order arrives twice" immediately, and that answer is the requirement.

**Volume and schedule** — how many records per run and per day, expected peak, how long one run may take, whether two runs may overlap, and whether the source needs paging when a run is large.

**Auth and secrets** — how each side authenticates, which credentials are needed by name, and where they are stored. Never ask anyone to paste a secret into the conversation. Record the NAME of each credential and nothing else.

## Turning an existing conversation into the plan

When the answers already exist in the conversation, do not re-interview. Synthesize the plan from what was actually said, and write `Not established — see Open questions` for everything that was not. Every filled section must be traceable to something the person actually said; do not complete a pattern because it sounds likely.

Check coverage before writing. If more than half of the ten headings would read "Not established", the conversation is too thin for a plan: say so, and offer a short interview on just the gaps instead of producing a hollow document.

## When the interview is done

The interview is done when a builder could work from the plan without coming back to this person. Judge it that way rather than by counting topics covered: a topic can be covered and still leave the builder guessing. An open question with a named owner counts as settled by delegation, not as a gap, which is what lets the interview end while an unknown remains.

## Read it back before you write it

Before the formal plan, read your understanding back in plain language: a few sentences of what will happen, in the user's own words, ending with what you are least sure about. Keep it a summary they can check in under a minute, not the plan itself. Reading ten headings back to someone is how a read-back becomes a document nobody verifies. Let them correct it, and write the plan only after they agree the understanding is right.

## Write the plan

When the topics are done, write the plan using **exactly these ten headings**, in this order, every time. Always emit all ten. Where something is genuinely unknown, write `Not established — see Open questions` under that heading rather than deleting it. The same shape every time is what makes these plans comparable and reviewable.

```markdown
## 1. Overview
## 2. Source system
## 3. Target system
## 4. Trigger
## 5. Data mapping
## 6. Error handling
## 7. Volume & schedule
## 8. Auth & secrets
## 9. Open questions
## 10. Build handoff
```

Guidance per section: keep **1. Overview** to a few sentences a stakeholder can read — what moves, from where to where, and why. Add two short lists there: what is out of scope (one or two lines; naming what this integration deliberately does not do stops the build from growing it), and acceptance criteria (two or three checks that would show the integration works, each verifiable by a person). If any part of the integration should be a shared building block other integrations call, say so here in one sentence. Put the field-by-field mapping in **5** as a table with source field, target field, and transformation; that table is the section builders will use most. Keep **9. Open questions** honest and specific, each phrased so it can be answered by one person in one sentence, and name that person or role. List credentials in **8** by name only.

The plan is aligned with the Frends Integration Requirements Document (FIRD), the format a Frends integration is specified in for delivery, so a delivery team can pick the plan up without translation. One plan describes one integration need, but the build may implement it as one Process or several: split when parts start from different triggers or schedules, when a part is a shared building block other integrations call, or when one Process would be too large to read and validate. The build handoff names every Process the plan implies.

## The build handoff block

End the plan with a structured summary the build step can read. Use this block with these keys, filling `null` or an empty list where an answer is genuinely unknown:

```yaml
integration_name: order-status-sync
confirmation_status: pending   # set to confirmed only after the user approves the plan
source:
  system: webshop
  interface: REST API
  auth_method: OAuth client credentials
target:
  system: ERP
  interface: REST API
  auth_method: API key in header
processes:
  - name: order-status-sync
    mode: new                  # new, or edit for a new version of an existing Process
    existing_process: null     # name of the Process this changes, when mode is edit
    current_behavior: null     # what that Process does today, required when mode is edit
    trigger:
      type: schedule
      config_summary: hourly, 07:00-19:00 on weekdays
    steps:
      - read orders changed since the last run
      - look up the customer in the target system
      - create or update the order
      - report a summary
    acceptance_criteria:
      - a run over yesterday's changed orders creates every one of them in the ERP
      - a record the ERP rejects is collected and reported, and the run still finishes
    out_of_scope:
      - does not delete orders in the ERP
      - does not backfill history
    depends_on: []
mappings:
  - source_field: order.id
    target_field: SalesOrder.ExternalId
    transform: none
  - source_field: order.total_cents
    target_field: SalesOrder.Total
    transform: divide by 100
error_policy:
  retries: 3 with backoff
  on_failure: skip the record, collect it, email the integration owner
schedule_or_volume: about 500 orders per day, peak 200 in one hour
credentials_needed:
  - webshop_client_secret
  - erp_api_key
open_questions:
  - question: which side owns the customer record if both have changed
    owner: ERP product owner
```

`processes` is a list on purpose: when the plan splits the work, add one entry per Process, each with its own trigger and steps, and use `depends_on` to name which Processes must exist first.

Four keys carry the weight a builder needs and a reviewer checks against. `mode` decides whether this becomes a brand-new Process or a new version of one that exists, which is the choice a builder cannot recover from once a draft is promoted, so state it rather than leaving it to the name. `existing_process` and `current_behavior` give a builder editing something live a baseline to preserve and a reviewer a way to tell an improvement from an accident. `acceptance_criteria` are per Process and each one is something a person can check on its own; whole-integration criteria in section 1 cannot tell a builder when the second of three Processes is done. `out_of_scope` per Process is the fence that stops a build growing past what was agreed. Name Processes, never identifiers: a draft id dies at promotion and a deployment id points at a version that moves. Treat these keys as a working shape rather than a fixed contract: they are chosen to carry what a build step needs, and they may be adjusted as the receiving side firms up. Keep the keys stable within a plan, and never put a secret VALUE in `credentials_needed` — names only.

Do not start building, and do not let a build step start, until the user has confirmed the plan; record that in `confirmation_status`.

## When the answer belongs to someone who is not here

Some open questions belong to a person who is not in the conversation: the ERP administrator, whoever owns the credentials, the person who knows what the old integration did. Those questions cannot be closed by asking harder. Offer to write a questionnaire the user can send.

Write one questionnaire per owner, not one for the project. Two people with different jobs need different context and a different tone, and a document written for both gets answered carefully by neither.

Each questionnaire opens with why it exists and the decision waiting on it, then says how the answers will be used: name the plan section each answer fills, so the recipient can see their answer has somewhere to go. Give one short paragraph of context for someone who was not in the conversation, and say that partial answers and "I do not know" are useful, because a flagged uncertainty is worth more than a confident guess. Then the questions: the ones that block the build first, marked as blocking, each a single idea rather than three joined by "and", each with an empty line beneath it to write in. Add a one-line "why this matters" only where a question could be read the wrong way. Close with a catch-all asking what you did not think to ask, which is where the constraint nobody mentioned usually appears.

When the filled questionnaire comes back, take it the same way as any other conversation that already holds the answers: synthesize from what was written, mark what is still missing, and update the plan and its handoff block.

## Staying useful across tools

This skill keeps product knowledge out of the interview: no Task names, no platform-specific field names in the questions. Two Frends-specific things are deliberate: when a tenant is connected the skill may look facts up there, and the written plan is FIRD-aligned. The build step supplies the rest when the plan is handed over — in a Frends context, that is where Task and Task package knowledge lives, not here.

The file is a plain instruction document. It loads automatically as a skill in Claude Code and Claude Desktop, and the same text can be pasted or attached as context in another AI client with no change.

Uses (verify against the session's tool list, all optional): `get_overview`, `list_processes`, `list_tasks`, `list_environment_variables`.
