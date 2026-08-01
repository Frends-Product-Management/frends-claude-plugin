---
name: integration-planning
description: Interview someone about an integration they want, one topic at a time, and turn their answers into a written integration plan the build step can work from. Use when someone asks to connect two systems, describes an integration they want built, or says they want to plan or scope an integration before building it.
---

# Planning an integration before you build it

Most integration requests arrive as one sentence: "connect our webshop to our ERP". That sentence hides a dozen decisions. Build first and you discover them one crash at a time. This skill turns the sentence into a plan.

Your job here is to interview, then write. You are not building anything in this skill, and you should not start.

## Interview one topic at a time

Restate the goal once, in your own words, so the person can correct you cheaply. Then work through the seven topics **in this order**, asking about **one topic per message**:

1. Source system
2. Target system
3. Trigger
4. Data mapping
5. Error handling
6. Volume and schedule
7. Auth and secrets

Rules that make this work:

- **One topic per message.** Never ask about two topics at once, however short the questions look. A wall of questions gets a wall of silence, or answers to the easy half only.
- **Offer two or three example answers** with each question. People answer "how often should this run?" badly, and answer "hourly, nightly, or as soon as each order appears?" well.
- **Skip what they already told you** — acknowledge it instead. If the first sentence said "when an order is paid", the trigger topic is answered; confirm it and move on.
- **One follow-up per topic, maximum.** If the answer is still unclear after that, write it into `## 9. Open questions` and keep going. An interview that never ends produces no plan.
- **Do not invent answers.** "Not established" is a real, useful outcome. A plan that admits three unknowns is far more valuable than one that quietly guesses them.

### What to ask about in each topic

**Source system** — which system holds the data, how you reach it (an API, a database, a file location, a queue), and how one record is identified. If files: where they appear, the filename pattern, and what happens to a file once it is handled.

**Target system** — which system receives the result, through which interface, and whether the operation creates, updates, or replaces. Ask what should happen when the record already exists there.

**Trigger** — what starts a run: a schedule, an incoming call, a file or message arriving, or a person pressing a button. If something arrives, ask how the integration learns about it, and how often it should look.

**Data mapping** — which fields move, field by field, and which ones need reshaping rather than copying: formats, units, date and number formats, derived values, and codes that differ between the two systems. Ask which values are calculated rather than read. If several sources are combined, ask how records from each are matched to each other.

**Error handling** — what counts as a failure worth stopping for, versus a bad record worth skipping and reporting. Ask whether a failed step should be retried and how many times, who must be told and through which channel, and whether one bad record should stop the whole run.

**Volume and schedule** — how many records per run and per day, expected peak, how long one run may take, whether two runs may overlap, and whether the source needs paging when a run is large.

**Auth and secrets** — how each side authenticates, which credentials are needed by name, and where they are stored. Never ask anyone to paste a secret into the conversation. Record the NAME of each credential and nothing else.

## Write the plan

When the seven topics are done, write the plan using **exactly these ten headings**, in this order, every time. Always emit all ten. Where something is genuinely unknown, write `Not established — see Open questions` under that heading rather than deleting it. The same shape every time is what makes these plans comparable and reviewable.

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

Guidance per section: keep **1. Overview** to a few sentences a stakeholder can read — what moves, from where to where, and why. Put the field-by-field mapping in **5** as a table with source field, target field, and transformation; that table is the section builders will use most. Keep **9. Open questions** honest and specific, each phrased so it can be answered by one person in one sentence. List credentials in **8** by name only.

## The build handoff block

End the plan with a structured summary the build step can read. Use this block with these keys, filling `null` or an empty list where an answer is genuinely unknown:

```yaml
integration_name: order-status-sync
source:
  system: webshop
  interface: REST API
  auth_method: OAuth client credentials
target:
  system: ERP
  interface: REST API
  auth_method: API key in header
trigger:
  type: schedule
  config_summary: hourly, 07:00-19:00 on weekdays
steps:
  - read orders changed since the last run
  - look up the customer in the target system
  - create or update the order
  - report a summary
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
  - which side owns the customer record if both have changed
```

Treat these keys as a working shape rather than a fixed contract: they are chosen to carry what a build step needs, and they may be adjusted as the receiving side firms up. Keep the keys stable within a plan, and never put a secret VALUE in `credentials_needed` — names only.

## Staying useful across tools

This skill deliberately contains no product-specific knowledge: no task names, no platform-specific field names, no assumptions about which engine runs the result. That is what lets one plan serve a review conversation, a ticket, and an automated build step equally well. The platform's own build step supplies the product specifics when the plan is handed over — in a Frends context, that is where task and connector knowledge lives, not here.

The file is a plain instruction document. It loads automatically as a skill in Claude Code and Claude Desktop, and the same text can be pasted or attached as context in another AI client with no change.
