# API endpoint

Something calls in over HTTP and waits for an answer.

## Ordered shapes

1. HTTP Trigger. Method, path and the request schema live here; the caller's body, headers and query arrive as `#trigger.data`, `#trigger.headers` and `#trigger.query`.
2. Read and check the input. An expression or Code shape that picks the fields the Process needs, so every later shape reads a named Process variable instead of digging into the trigger.
3. Call the system. One Task per system call, configured from its template, with the URL and credentials referenced from environment variables.
4. Shape the answer. An expression or Code shape that builds the response body.
5. HTTP result shape. Status code, content type and content. Every path, including the failure path, ends in one.

## Error handling seen in real endpoints

Endpoint Processes in the sample did not wrap their calls in scope and catch. They set the HTTP Task not to throw on an error response, read the status code the other system returned, and passed it on to the caller with the body it came with. The caller then sees the same failure the endpoint saw, which is what an API client expects. Scope and catch belong here only when the plan says a failure must be hidden from the caller and handled inside.

## Usual mistakes

- A path with no HTTP result shape, so the caller gets nothing back.
- Reading `#trigger.data` deep inside the Process instead of once at the start; a schema change then breaks several shapes at once.
- Returning a 200 with an error message in the body; the caller's code sees success.
- Testing with a hand run: `start_process` runs without trigger data, so an endpoint that reads the request must be tested through its endpoint after the user has decided to activate it.
