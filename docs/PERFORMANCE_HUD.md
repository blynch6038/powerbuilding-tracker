# Performance HUD

Approved direction: graphite surfaces, orange accent, large current-set controls, set ring, and consistent Workout / Program / Progress styling.

## Workout tools

- Compare the current lift with an earlier completed session for the same exercise identity. Program week/day order determines chronology; editing older history does not make it the latest session.
- Tap a completed set to correct its weight, reps, or RPE. Prior records keep their existing IDs and sync contracts.
- Completing a newly unfinished set starts a 90-second rest deadline after local save succeeds. Corrections to an already completed set do not restart rest. Add 30 seconds or skip. Deadlines survive navigation/relaunch per account and workout. Background notification delivery is not implemented; the correct remaining time returns when foregrounded.
- Notes preview the newest entry for that exercise and workout. Existing append-only notes remain available.
- Open the workout overview with its button or swipe upward on the set ring. Reorder on this device; order does not sync across devices.
- Plate calculator uses pounds, defaults to a 45 lb bar, and supports changing bar weight. Standard plates: 45, 35, 25, 10, 5, 2.5, 1.25. Remainders are shown rather than silently rounding. It never modifies logged weight.
- Recap shows working-set count, loaded repetition volume, changes from the previous matching day, and exercise load records relative to earlier program sessions. Partial sessions remain explicitly partial. Load records do not imply an all-time record outside this block.
- Goal tracking uses Epley estimates for 1–10 reps and displays recorded singles separately. An estimated 225 lb does not mean the lifter has tested 225 lb.
- Haptics depend on platform support. Browser vibration is unavailable on some devices, including Safari on iOS. Reduced-motion preferences are respected for ring transitions.

## Validation and release

Web: `npm run build` includes TypeScript, program, recommendation, substitutions/restoration, notes sync, performance calculations, and production/PWA compilation. Isolated interactive checks covered warm-up defaults, successful-save advancement, completed-set edit, correct swap target, rest start/skip, plate-dialog isolation, and failed-save retention.

iOS: macOS CI runs `sh Scripts/test-native.sh`, recommendation parity, and an unsigned iOS Simulator build. Device appearance, haptics and keyboard ergonomics require iPhone validation. No backend schema change is needed. Existing account data remains in place.
