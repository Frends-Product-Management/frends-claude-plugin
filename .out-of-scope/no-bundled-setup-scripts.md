# The plugin ships instructions, never an executable

This plugin ships skill documents and a connector manifest. It will not ship a shell script, a PowerShell script, or any other executable that captures, stores, or sends a Frends API token. Requests for a one-click connect script are out of scope.

## Why this is out of scope

The only value setup handles is a token that grants access to a customer's tenant. A script that handles it would be a piece of executable code, distributed through a public marketplace, that touches a credential. That is a supply chain someone has to trust, maintain across three shells, and re-verify every time the platform's authentication changes. The plugin buys very little for that cost: setup is four steps a person does once.

The escape hatches already exist:

- The `getting-connected` skill walks a person through setup one stage at a time, and never asks for the token itself.
- The README carries the same commands for each operating system, to run by hand.
- A team that wants this automated internally can write a script for their own environment, where they control the distribution and the review.

## Prior requests

- 2026-09-05: "a prompt that will setup plugin automatically, because most of the people doesnt do clickops and copy paste". Answered with the setup prompt in the README: it is instructions the person pastes into their AI client, not an executable, and the token still goes into their own terminal. The boundary stands.
