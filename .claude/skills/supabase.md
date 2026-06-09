# Supabase

This project uses Supabase for database, authentication, and real-time subscriptions.

## Clients

Three Supabase clients are configured under `src/lib/supabase/`:

1. **Browser Client** (`src/lib/supabase/client.ts`): For React island components using `@supabase/ssr`
2. **Server Client** (`src/lib/supabase/server.ts`): For Astro server-side code using `@supabase/ssr` with a custom cookie adapter
3. **Admin Client** (`src/lib/supabase/admin.ts`): For API routes requiring elevated privileges using `@supabase/supabase-js` with service role key

## Database Schema

See `supabase/schema.sql` for the full schema.

Key tables:
- `loglines`: Stores logline posts
- `comments`: Stores comments on loglines

## RLS Policies

- Anonymous users can read all data
- Anonymous users can insert loglines and comments
- Only authenticated users (admins) can update/delete

## Environment Variables

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
