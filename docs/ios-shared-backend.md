# Native iOS shared backend contract

The dedicated private `blynch6038/PowerBuilder-iOS` repository targets the SAME PowerBuilder Supabase project `qfrkiymocabzwwdmomnq`. Use the same invited account: no second workout database and no separate import of server history.

The native client uses `members`, `set_logs`, `exercise_substitutions` and `sync_set_log` as implemented by src/client.ts. Canonical set IDs remain `user_id:week:day:exercise_id:set_number`. Warm-up and substituted exercise IDs must remain stable. Native changes arrive as ordinary set_logs rows; the web client's existing pull loop reads them. Do not clear IndexedDB or alter imported history for iOS setup.

The iOS bundle's Training.js is generated from program.ts, templates.ts, recommendations.ts, warmupSchedule.ts and substitutions.ts. When those files change, regenerate it in the iOS repository with `node Scripts/generate-training.cjs ../powerbuilding-tracker`, then run both clients' tests. Native settings currently follows substitutions edited here; native substitution editing is deferred.

Offline writes on both clients use account-scoped pending records. The existing RPC checks client timestamps, not server revisions; concurrent same-set writes and skewed clocks can still race. Do not change this API for only one client. A stronger versioned revision-based API needs a coordinated rollout and mixed-client tests before retiring the old RPC. No backend/schema change accompanies this document.

Before release, sign in to an invited test account on both clients, compare existing records, verify writes in both directions, reopen offline then reconnect, and test same-set conflict, session expiry, a non-member account and another owner's access. Native mock tests and unsigned compilation do not substitute for authenticated device/browser validation. Keep JSON backups and original browser cache until those checks pass.
