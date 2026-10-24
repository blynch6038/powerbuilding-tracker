# Powerbuilding Tracker

iOS-inspired offline-first React Progressive Web App hosted on GitHub Pages, using the **PowerBuilder** Supabase project for invited-user authentication and persistent PostgreSQL workout logs.

**App:** https://blynch6038.github.io/powerbuilding-tracker/

## Deployment
This repository includes `.github/workflows/deploy.yml`. In GitHub **Settings → Pages**, select **GitHub Actions** as the Build and deployment source. GitHub Actions then publishes each push to `main`.

## Supabase
Connected project: `qfrkiymocabzwwdmomnq`. Database tables `public.members`, `public.set_logs`, RPC `sync_set_log`, and per-user RLS policies were created through the connected Supabase integration. Public account signup is disabled. Invite users using **Supabase → Authentication → Users → Invite user** and set Site URL/Redirect URLs to the GitHub Pages URL. Only browser-safe Supabase publishable key is in the frontend.

## Storage and offline behavior
Each edited set is immediately saved to IndexedDB on the device. Sync occurs on sign-in, when the connection returns, and periodically while the page is open. Conflicting remote changes are not overwritten automatically. For important backups use Settings → Export JSON; browser data may be lost if cleared. Keep an exported backup until end-to-end testing is complete.

## Security
Never commit a service-role or secret key. Authentication uses Supabase Auth. RLS limits set records to the authenticated owner. No public registration UI is included.

## Current limits
Invitation acceptance, production site and real user workout sync require end-to-end browser verification. Offline first visit requires an earlier online load to cache PWA assets. Workout plans are included, but workout histories are tied to the current account.
