# Supabase deploy notes

## Current local state

- Supabase base schema: `supabase/schema.sql`
- Incremental migrations: `supabase/migrations/*.sql`
- Seed data and storage buckets: `supabase/seed.sql`
- Consolidated deploy bundle: `supabase/deploy-all.sql`
- Split SQL Editor steps: `supabase/deploy-steps/*.sql`
- No `supabase/config.toml` is present yet.
- Supabase CLI was not found in the current PATH.
- No local `.env` exists yet; use `.env.example` as the checklist.

## Fresh Supabase project order

Run these SQL files in this order against a clean Supabase project:

1. `supabase/schema.sql`
2. `supabase/migrations/20260610_r5_production_infra.sql`
3. `supabase/migrations/20260610_r6_real_ai_providers.sql`
4. `supabase/migrations/20260610_r6_5_security_hardening.sql`
5. `supabase/migrations/20260610_r6_6_supabase_clean_billing.sql`
6. `supabase/migrations/20260610_r11_platform_ecosystem.sql`
7. `supabase/migrations/20260611_c1_workspace_security.sql`
8. `supabase/migrations/20260612_c9_provider_credentials.sql`
9. `supabase/seed.sql`

## Required app env values

Create `.env.local` or `.env` from `.env.example` and fill at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `APP_URL`
- `STORAGE_BUCKET`
- provider keys only when real AI/media providers are enabled

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.

## Manual dashboard path

If the CLI is unavailable, open Supabase Dashboard > SQL Editor and run each SQL file in the order above.

For convenience, `supabase/deploy-all.sql` already contains the same files in the correct order. Use it only on a clean Supabase project or after reviewing conflicts.

If the SQL Editor fails with a generic parsing error, run the smaller files in `supabase/deploy-steps` one by one:

1. `01_schema.sql`
2. `02_r5_production_infra.sql`
3. `03_r6_real_ai_providers.sql`
4. `04_r6_5_security_hardening.sql`
5. `05_r6_6_supabase_clean_billing.sql`
6. `06_r11_platform_ecosystem.sql`
7. `07_c1_workspace_security.sql`
8. `08_seed.sql`
9. `09_c9_provider_credentials.sql`

After the SQL is applied:

1. Create or confirm Auth redirect URLs:
   - local: `http://localhost:3000/auth/callback`
   - production: `<APP_URL>/auth/callback`
2. Confirm private storage buckets exist from `seed.sql`.
3. Fill `.env.local`.
4. Run `npm run build`.
5. Start the app and check `/api/admin/health`.

## CLI path

After installing and logging into Supabase CLI:

```powershell
supabase login
supabase link --project-ref <project-ref>
```

For this project state, prefer applying the SQL files in the order above unless the migrations are reworked into a complete first migration.
