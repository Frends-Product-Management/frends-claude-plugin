# No second-model judge ships with the plugin

The loop harness separates the maker from the reviewer, and both run on whatever model the person's session uses. Bundling a second model family as an independent judge, through another vendor's CLI or API, is out of scope.

## Why this is out of scope

A bundled judge needs a second account, a second credential and a second billing relationship the plugin cannot assume, and a hard dependency on another vendor's CLI breaks the install for everyone who does not have it. Worse, a judge that silently fails to run turns into a rubber stamp: the run reads as reviewed when nobody reviewed it.

The harness therefore does the honest smaller thing: at convergence the reviewer agent's verdict stands, and the closing summary names that no second-family judge ran. An absent judge is named, never silent.

## What would have to change

A served, vendor-neutral way to request an independent verdict, or plugin-level user configuration that makes a second reviewer an explicit opt-in with its own credential. Either would reopen this decision.
