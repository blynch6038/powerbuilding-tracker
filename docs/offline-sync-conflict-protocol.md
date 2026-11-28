# Offline sync conflict protocol and recovery

## Data contract

Workout sets and exercise substitutions carry a server-owned, monotonically increasing `version`. Offline edits remember the version they were based on. A sync write succeeds only if the stored version still matches; otherwise both the device and cloud copies remain available for explicit resolution.

A new row uses a null expected version and can only insert if its ID does not already exist. An edit or deletion must present the version last observed by that device. Restoring a set tombstone requires an explicit user resolution and the tombstone's current version.

Timestamps remain useful for display and audit. They do not decide which offline change wins.

## Rollout order

1. Preserve the current database backup and record per-user set, tombstone, and substitution counts.
2. Apply the additive schema migration before shipping clients that call its RPC.
3. Verify the new version columns, RPC signatures, triggers, row counts, and owner-scoped RLS.
4. Deploy web, then ship the iOS build through the intended TestFlight workflow.
5. Keep the old sync RPCs available during rollout so older installed clients remain compatible.

The set-log versioned RPC is already present in the PowerBuilder project. The substitution migration and client support are being staged together and must not be released separately.

## Recovery

- If an app release has a problem, roll back that app to its previous known-good build or commit. The additive database objects can remain in place; old clients continue using the existing endpoints.
- Do not drop version columns or triggers as an app rollback. Doing so would discard concurrency history and could make newer clients unsafe.
- Correct schema or data problems with a forward migration. Do not use a destructive down migration on workout history.
- Before and after a database change, compare per-user row counts and tombstone counts. Confirm RLS remains enabled and that the versioned functions execute only for the authenticated owner.
- If a client is stuck on a conflict, retain both copies, review the device and cloud values, then explicitly choose the version to keep. For a deleted set, the device choice is an explicit restore.

## Release acceptance

The implementation is not release-ready until the final web, iOS, and disposable database validation passes; offline conflict cases are checked on both clients; and the production migration ledger matches the source migration filename.
