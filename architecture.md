# Paperlevels Architecture

## Overview

Paperlevels is a PoC site for measuring demand with a one-line logline. Users can post without logging in, share posts, and leave comments. The share count is used as a simple demand signal.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Astro 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui + Base UI |
| Runtime | Cloudflare Workers |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth for admin-only access |
| Tests | Vitest + Playwright |

## Repository Layout

```
src/
  pages/
    index.astro
    about.astro
    admin.astro
    admin/login.astro
    p/[id].astro
    api/
      loglines.ts
      comments.ts
      share.ts
      admin/
        delete-logline.ts
        delete-comment.ts
        update-category.ts
  layouts/
    Layout.astro
  components/
    admin/
      AdminDashboard.tsx
      AdminLoginForm.tsx
    comments/
      CommentForm.tsx
      CommentList.tsx
      CommentSection.tsx
      MarkdownRenderer.tsx
      OgpPreview.tsx
    layout/
      Header.tsx
      Footer.tsx
      ScrollToTop.tsx
    loglines/
      LoglineCard.tsx
      LoglineFeed.tsx
      LoglineForm.tsx
      ShareButton.tsx
    ui/
      ...
  lib/
    actions.ts
    data.ts
    utils.ts
    supabase/
      client.ts
      server.ts
      admin.ts
  styles/
    global.css
  types/
    database.ts

supabase/
  schema.sql

tests/
  api/
  db/
  lib/
  env/
  helpers.ts
  setup.ts

e2e/
  *.spec.ts
```

## Request Flow

### Public logline creation

1. `src/pages/index.astro` renders the form and logline feed.
2. `src/pages/api/loglines.ts` validates and inserts a logline.
3. The API route uses the server Supabase client and returns JSON for the UI.

### Comment creation

1. `src/pages/p/[id].astro` renders the logline detail page.
2. `src/pages/api/comments.ts` validates and inserts a comment.
3. The comment count on `loglines` is incremented separately.

### Share count

1. `src/components/loglines/ShareButton.tsx` triggers the share action.
2. `src/pages/api/share.ts` increments `share_count`.
3. The UI uses the updated count for popularity ordering.

### Admin actions

1. `src/pages/admin/login.astro` and `src/components/admin/AdminLoginForm.tsx` handle login.
2. `src/pages/admin.astro` and `src/components/admin/AdminDashboard.tsx` handle moderation.
3. Admin API routes under `src/pages/api/admin/` perform delete and update operations using the service role key.

## Data Model

```
loglines (1) ───< comments (N)
```

### `loglines`

- `id`: string primary key
- `content`: text, 1 to 140 chars
- `category`: nullable text
- `share_count`: integer default `0`
- `comment_count`: integer default `0`
- `created_at`: timestamp
- `updated_at`: timestamp

### `comments`

- `id`: UUID primary key
- `logline_id`: FK to `loglines.id`
- `content`: text, 1 to 5000 chars
- `created_at`: timestamp

## Test Layout

- Vitest unit/integration tests live in `tests/**/*.test.ts`
- Shared test utilities live in `tests/helpers.ts`
- Test environment setup loads `.env.local` in `tests/setup.ts`
- Playwright specs live in `e2e/*.spec.ts`

## Key Decisions

- No public login flow: posting is intentionally low-friction
- Loglines are immutable: no user edit/delete path
- Comments are append-only: moderation is admin-only
- Share count is tracked explicitly rather than inferred from the social platform
- Supabase Auth users are created manually from the dashboard

## Environment Variables

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
