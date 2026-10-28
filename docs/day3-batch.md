# Day 3 program and exercise-choice batch — October 27, 2026

Weeks 2–9 Day 3 default to Cable Biceps Curl (3×10–12) and Dumbbell Chest Press. Chest press retains the floor-press prescription: 3×8 in Weeks 2–8, 2×8 in Week 9. Week 1 and Week 10 are unchanged. Explicit saved exercise choices continue to take precedence.

Program slot IDs remain `rkc-plank` and `dumbbell-floor-press` for compatibility with existing choice rows. Actual curl/chest-press sets use the existing `original-id--sub--replacement-slug` identity, including choices saved by the earlier implementation. Reverting to the original movement selects its original log IDs. No logs are renamed, copied, deleted, seeded, or migrated. Web exposes prior movement records read-only; native retains Shared history and exports. Native analytics retains original plank units and floor-press labels.

Both apps support current-week or current-and-future choices only where the same program slot exists. Week 10 recovery does not receive a Day 3 substitution. Choices use the existing account-owned Supabase `exercise_substitutions` table; set logs remain separate. Existing substitution upserts remain last-writer-wins if devices edit the same choice concurrently; this batch introduces no database/schema changes. Pending edits survive offline restart. Workout selection is validated and remembered per account, including Program navigation. Corrupt/unavailable preferences fall back to Week 1 Monday.

## Verification

- Web: TypeScript check, all 50 program days/289 prescriptions, recommendation regression tests, substitution/default/scope and account-selection tests, Vite production/PWA build.
- Native: isolated temporary caches and mocked HTTP contract suite covers IDs, offline/restart, scope, upload headers/body, history preservation, account isolation, old-cache decoding, failed-save rollback and workout restoration.
- Bundled native program, warmups, all alternative resolutions and 7,514 recommendation scenarios match independently compiled web sources.
- Unsigned iOS device build succeeds with Xcode 27.1. This restricted runner requires `OTHER_SWIFT_FLAGS='-Xfrontend -disable-sandbox'` for compiler macro plugins; normal command failed to launch those plugins. The setting was passed to the check only, not saved in the project.
- No authenticated production data was read or written. Live two-device authenticated sync, browser/native UI interactions, physical-device signing/install and TestFlight remain unverified. The batch was merged into both repositories on October 27, 2026 (web PR #2 and iOS PR #2). Merge status does not establish a successful web deployment or installation of a signed native build. See the [change log](../CHANGELOG.md) for commit timestamps.
