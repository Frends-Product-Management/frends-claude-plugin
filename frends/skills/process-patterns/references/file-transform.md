# File transform

A file appears, gets parsed, transformed and sent onward. Some exchanges also wait for the other side's answer file.

## Ordered shapes

1. File watch trigger on the folder or share where the file lands.
2. Read and parse the file into a structure; parsing is its own shape so a bad file fails there, with a clear message, before anything is sent.
3. Transform. An expression or Code shape, or a mapping Task, producing the outgoing structure.
4. Deliver. Write the file, call the endpoint or send the message.
5. Handle the source file: move it to a done folder or an error folder. A file left where it was found is picked up again.
6. Return with the file name and the outcome.

## Error handling seen in real file exchanges

Exchanges that must wait for an acknowledgement did not poll in a loop. They saved a checkpoint after sending and used a timed rehydration wait, so the run paused and resumed when the wait elapsed, then read whether the answer had arrived. A parse failure moved the file to an error folder and reported it; a delivery failure left the file in place for the next attempt.

## Usual mistakes

- No rule for what happens to a file once handled, so the same file is processed twice.
- No path for a file that fails halfway; the file is neither in done nor in error.
- Parsing and transforming in one shape, so a bad file and a bad mapping look the same in the run history.
