# Task chain

A short utility a person starts by hand: a few Tasks and expressions in order, and a result.

## Ordered shapes

1. Manual Trigger with its parameters declared; each is read as `#trigger.data.<name>`.
2. Two to five shapes in one line: a Task, an expression that reshapes its result, the next Task.
3. Return with the result the person wanted to see.

## Error handling seen in real chains

None beyond the platform's own: a chain that fails stops and shows the error in the run history, which is what a person running it by hand wants. Add scope and catch only when the chain grows a step whose failure must not stop the rest.

## Usual mistakes

- Growing a quick chain into a real integration without revisiting the trigger or the error handling.
- Declaring a parameter with a default and relying on it; the served execute-process guide says what a hand run does with defaults, and it is not what people expect.
- Doing work in the Return expression instead of in a shape of its own, which hides it from the run history.
