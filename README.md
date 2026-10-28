# Powerbuilding Tracker

iOS-inspired offline-first React Progressive Web App hosted on GitHub Pages, using the **PowerBuilder** Supabase project for invited-user authentication and persistent PostgreSQL workout logs.

**App:** https://power.lynchnetwork.com

**Native iOS:** [PowerBuilder-iOS](https://github.com/blynch6038/PowerBuilder-iOS) uses the same account and backend.

## Documentation

- [Dated change log and commit history](CHANGELOG.md)
- [Day 3 defaults, exercise choices, history preservation, and validation](docs/day3-batch.md)

## Deployment
This repository includes `.github/workflows/deploy.yml`. In GitHub **Settings → Pages**, select **GitHub Actions** as the Build and deployment source. GitHub Actions then publishes each push to `main`.

## Supabase
Connected project: `qfrkiymocabzwwdmomnq`. Database tables `public.members`, `public.set_logs`, `public.exercise_substitutions`, RPC `sync_set_log`, and per-user RLS policies were created through the connected Supabase integration. Public account signup is disabled. Invite users using **Supabase → Authentication → Users → Invite user** and set Site URL/Redirect URLs to the custom-domain origin `https://power.lynchnetwork.com` (with the required invitation/password-reset redirect paths). Only browser-safe Supabase publishable key is in the frontend.

## Storage and offline behavior
Each edited set is immediately saved to IndexedDB on the device. Sync occurs on sign-in, when the connection returns, and periodically while the page is open. Set-log synchronization uses timestamp checks; simultaneous edits and clock skew can still race. Exercise-choice upserts are last-writer-wins. These mechanisms do not guarantee lossless concurrent editing. For important backups use Settings → Export JSON; browser data may be lost if cleared. Keep an exported backup until end-to-end testing is complete.

## Security
Never commit a service-role or secret key. Authentication uses Supabase Auth. RLS limits set records to the authenticated owner. No public registration UI is included.

## Program and workout behavior

The TypeScript/React app includes all 10 weeks and 50 workouts, prescribed warm-ups, Day 1–Day 5 labels, optional weight recommendations, RPE entry, and exercise choices for the current week or applicable future weeks. Weeks 2–9 Day 3 default to Cable Biceps Curl (3×10–12) and Dumbbell Chest Press, preserving original set/rep counts and independent exercise histories. Last selected workout is remembered per account.

## Current limits
Invitation acceptance, production site and real user workout sync require end-to-end browser verification. Offline first visit requires an earlier online load to cache PWA assets. Workout plans are included, but workout histories are tied to the current account.
