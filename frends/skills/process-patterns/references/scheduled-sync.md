# Scheduled sync

Nothing calls in. The Process wakes up on a schedule, reads what changed, and acts.

## Ordered shapes

1. Schedule Trigger with the interval, or a Manual Trigger beside it so a person can start a run by hand; both feed the same first shape.
2. Work out "changed since the last run". A stored watermark such as a timestamp or a last-seen id, read at the start and written at the end. Without this shape the sync has no definition of what it syncs.
3. Read the source records.
4. Loop over the records with a Foreach shape. Inside it, map one record and write it to the target.
5. Write the new watermark, then Return with counts: read, written, skipped.

## Error handling seen in real syncs

Syncs in the sample treated a bad record as data, not as a failure: the record was written to a skipped list with the reason, the loop went on, and the Return reported the counts. A whole run failed only when the source or the target could not be reached at all. Scope and catch inside the loop is how one bad record stays one bad record.

## Usual mistakes

- No watermark, so every run re-sends everything, or a watermark written before the writes succeed, so a failed run skips records forever.
- A run that takes longer than its interval and overlaps the next one; decide what happens then and write it down.
- Counting a run as success when zero records were read; a source that suddenly returns nothing is usually a broken source.
- Growing a quick sync into an integration without revisiting what the schedule and the watermark mean.
