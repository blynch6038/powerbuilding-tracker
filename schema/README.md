# Live Supabase Schema Baseline

This read-only metadata snapshot was captured from the active PowerBuilder Supabase project on 2026-11-28. It contains no application row data and is **not an executable migration**. It is a review aid for rebuilding and validating a source-controlled migration chain; do not apply it directly to production.

The snapshot records current public tables, columns, constraints, indexes, RLS policies, triggers, table grants, and public SQL function definitions. Supabase reports seven applied migration versions, listed in the JSON file, but the historical SQL bodies are not available through the migration-history listing. The current schema must therefore be treated as a baseline; this snapshot does not claim to reconstruct migration chronology.

The live `public.exercise_notes_user_id_fkey` has `ON DELETE CASCADE`; the existing [schema/exercise_notes.sql](./exercise_notes.sql) creation script omits that later change. Keep the historic source file unchanged until the seven migrations are recovered or a reviewed baseline/reconciliation plan is approved.

The active `delete-account` Edge Function source is included for source control. Supabase reports gateway JWT verification disabled for the function; the function itself verifies the bearer token with Supabase Auth before deleting the authenticated user's own account. The source refers to the service-role secret by environment variable name only; no secret values were captured.
