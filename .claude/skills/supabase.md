# Supabase

This project uses Supabase for database, authentication, and real-time subscriptions.

## Clients

Three Supabase clients are configured:

1. **Browser Client** (`lib/supabase/client.ts`): For Client Components using `@supabase/ssr`
2. **Server Client** (`lib/supabase/server.ts`): For Server Components using `@supabase/ssr`
3. **Admin Client** (`lib/supabase/admin.ts`): For Server Actions requiring elevated privileges using `@supabase/supabase-js` with service role key

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
