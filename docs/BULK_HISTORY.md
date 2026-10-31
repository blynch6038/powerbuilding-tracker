# Bulk history editor (web only)

Open History in the bottom navigation or `https://power.lynchnetwork.com/#history` after signing in.

1. Select a week or all weeks. Narrow by training day, exercise search and completion status. Warm-ups are hidden by default.
2. Optionally show unlogged planned sets for one week to fill missing history. Existing deleted rows are never recreated.
3. Edit cells directly, or select visible rows and use Apply to selected. Blank bulk fields leave values unchanged; Clear RPE explicitly removes RPE. Weight 0 is valid for bodyweight. Reps/count must be a whole number; holds and distance remain explicit counts as in the workout screen.
4. Use Correct exercise to fix which lift was actually performed. Review all changes, including hidden drafts, before saving. Revert a row or discard drafts to abandon unsaved work. Switching app tabs retains drafts; a browser reload does not.
5. Save reviewed changes. The batch is atomic on the device, appends before/after audit notes, and then syncs using existing account-scoped contracts. Follow the sync indicator; offline saves remain pending.

## Exercise history behavior

Numeric corrections keep the original record identity. An exercise correction creates a record with the replacement identity, retains the old record and values as incomplete, and changes only that workout's exercise choice. Earlier/future weeks are not automatically changed. Existing notes remain attached to their original exercise; a correction note links the before/after values. Current program naming does not silently reinterpret historic conventional deadlift or RKC plank records as another movement.

A replacement never overwrites an existing target row, including a deleted target. Correct that existing row instead. Mixed replacement choices for the same workout slot are rejected. Stale records/choices and newer cloud rows detected at online preflight stop the entire local batch. Cloud sync still uses the pre-existing per-record server API, so exercise moves may sync progressively; the pending queue remains until processed. This is not a new server-side multi-row transaction.

The editor filters all operations to the signed-in account and uses existing publishable-key/RLS sync. No live history is changed merely by deploying or opening it. Download backup exports current history and exercise choices before correction. No iOS code or database schema change is required; saved records are shared and appear on iOS after synchronization.

## Verification

`npm run build` runs program/recommendation/substitution/notes/performance regressions, bulk history contracts, TypeScript, production bundling/PWA generation, and the compiled theme check. `npm run test:history` exercises the pure planning rules and real IndexedDB transactions against a mocked transport. No user workout records are used in tests.
