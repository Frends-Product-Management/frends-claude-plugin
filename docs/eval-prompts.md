# Routing prompts

For maintainers. An AI client chooses a skill from its description alone, so a description change is a routing change. Work through this table by hand before a release: read each prompt, decide which skill you would expect to fire, and check the descriptions still send it there.

The ambiguous rows are the ones that matter. They are pairs of skills whose territory touches, written the way a real person phrases them.

## Clear cases

| Prompt | Should fire | Should not fire |
|---|---|---|
| "The Frends tools are not showing up" | getting-connected | anything else |
| "I get a 401 calling Frends" | getting-connected | find-and-inspect |
| "What integrations do we have in production?" | find-and-inspect | list-style guesses from build-a-process |
| "What does the order sync Process actually do?" | find-and-inspect | build-a-process |
| "The invoice integration started failing yesterday" | diagnose-failures | build-a-process, review-a-draft |
| "Why is this Process stuck?" | diagnose-failures | review-a-draft |
| "I want to connect our webshop to our ERP, ask me what you need" | integration-planning | build-a-process |
| "Turn what we discussed into a plan" | integration-planning, synthesis mode | a fresh interview |
| "Add an HTTP trigger to that draft" | build-a-process | process-patterns |
| "Build me a draft that reads orders and posts them to the ERP" | build-a-process | process-patterns |
| "Is this draft ready to promote?" | review-a-draft | build-a-process |
| "Check the draft against the plan" | review-a-draft | diagnose-failures |

## Ambiguous cases, and where each should land

| Prompt | Should fire | Why not the other one |
|---|---|---|
| "Set up a nightly sync to our ERP" | build-a-process | The verb is build. process-patterns is for when the shape is still open |
| "What kind of Process should a nightly sync be?" | process-patterns | The question is about shape, not about building one |
| "Something is wrong with my Process" | diagnose-failures | review-a-draft reads a draft before promotion; this is a Process already running |
| "Is my Process correct?" (a draft, not promoted) | review-a-draft | Nothing has run, so there is no failure to diagnose |
| "Review this integration" (no draft exists yet) | integration-planning | There is nothing to review; the plan is the artifact that exists |
| "How do I structure this, and then build it?" | process-patterns first, then build-a-process | Two steps, in that order; not one skill doing both |
| "The ERP admin needs to answer this" | integration-planning, questionnaire mode | Not a build or review question |
| "Which Tasks can I use for this?" | find-and-inspect | Tenant contents, not a build decision |

## What a failure looks like

A skill firing on a prompt in its should-not column, or nothing firing on a clear case. Fix it in the description, not in the body: a boundary written only in the body is read after the choice has already been made.
