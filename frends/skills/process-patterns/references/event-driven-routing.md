# Event-driven routing

Things arrive one at a time, and different kinds need different handling.

## Ordered shapes

1. The trigger that matches the arrival: a queue, a Service Bus subscription, an incoming call. One event per run.
2. Read the event once into Process variables, including the field the routing decides on.
3. A decision shape that classifies the event, with one branch per kind and a default branch for the kind nobody expected.
4. On each branch, the work for that kind, ending in its own Return or joining back before one.
5. Return with what was done and for which kind.

## Error handling seen in real routing Processes

The default branch is the error handling: an event that fits no kind is logged or parked, never dropped silently and never failed loudly enough to stop the queue. Failures inside one branch stay inside that branch when the plan says the queue must keep moving; scope and catch around the branch's work does that.

## Usual mistakes

- Classifying on a field not every event carries; the decision throws on the events that lack it.
- No default branch, so the unexpected kind ends the run with an unhelpful error.
- Two branches that do nearly the same work with a copy each; move the shared part in front of the decision or into a shared building block.
