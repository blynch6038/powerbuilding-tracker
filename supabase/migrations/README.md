# Recovered Applied Migrations

These seven SQL files were recovered verbatim from the active PowerBuilder project's `supabase_migrations.schema_migrations.statements` arrays on 2026-11-28 and retain the exact version and name recorded in the ledger. They are historical source for migrations already applied to production, not new changes.

The migration ledger's `rollback` field was null for all seven versions. No rollback SQL has been reconstructed. Do not run these files against the current production database as new migrations; first confirm the CLI recognizes each exact version as applied. Validate a clean build and an upgrade path in an isolated database before relying on these files for restore or future release work.

The [live schema snapshot](../../schema/live_supabase_snapshot_2026-11-28.json) captures the current public schema. It complements this historical SQL but is not itself executable.
