# Changing a live Environment stays a human decision

The building skill produces a Process draft and stops at a passing validation. Promoting a draft, deploying a version, activating a trigger, and running a Process are things the plugin explains and the person decides. Requests for an autonomous build-and-deploy path are out of scope.

## Why this is out of scope

These actions change what a customer's integration platform does, and several of them are hard to walk back. Promotion is itself a deployment: it puts a new version on the development Agent Group without a second confirmation. Deploying to another Agent Group reaches the Environments a business actually runs on, and activating a trigger makes an endpoint or a schedule live immediately. An AI client working from an interview transcript does not hold enough context to carry that risk, and the person who does hold it should be the one who acts.

Keeping a person in the loop for these steps is also what makes the plugin's behaviour explainable after the fact: every change to a live Environment traces to someone who approved it.

The escape hatches already exist:

- The draft is complete and inspectable, so approving it is a review rather than a leap.
- The `review-a-draft` skill reports what the draft does against the plan before anyone promotes it.
- Promotion and deployment are one action each in the Portal.
- The plugin's permission hook asks the person before any of these tools runs, whatever the skill said.

## Prior requests

None yet.

## The loop harness does not reopen this

The 0.7.0 loops were asked for as a full build-and-deliver harness, and they stop at the same line. Every loop ends at `approval-required` when promotion, deployment or a run is the next step, the builder agent is not granted those five tools at all, and the run record's tool events prove none was called. A loop automates the turns, never the decision.
