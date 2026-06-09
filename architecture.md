# Paperlevels Architecture

## Overview

Paperlevels is a PoC (Proof of Concept) site where users can post loglines (one-sentence hooks describing a site or product's purpose) without logging in. The share count serves as a proxy metric for demand validation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Backend | Astro API Routes + Supabase |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (admin only) |
| Hosting | Cloudflare Workers |
| OGP Preview | microlink.io |

## Project Structure

```
src/
  pages/
    index.astro           # Home page (hero, post form, logline list)
    p/[id].astro          # Logline detail page
    about.astro           # About page
    admin.astro           # Admin dashboard
    admin/login.astro     # Admin login page
    api/                  # API routes (replacing Server Actions)
      loglines.ts
      comments.ts
      share.ts
      admin/
        delete-logline.ts
        delete-comment.ts
        update-category.ts
  layouts/
    Layout.astro          # Root layout with Header/Footer
  components/             # React island components
    layout/
      Header.tsx
      Footer.tsx
    loglines/
      LoglineCard.tsx
      LoglineForm.tsx
      ShareButton.tsx
    comments/
      CommentForm.tsx
      CommentList.tsx
      MarkdownRenderer.tsx
      OgpPreview.tsx
    ui/                   # shadcn/ui components
  lib/
    data.ts               # Data fetching helpers
    utils.ts              # Utility functions
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server Supabase client
      admin.ts            # Admin Supabase client (service role)
  styles/
    global.css            # Tailwind CSS theme

supabase/
  schema.sql              # Database schema

types/
  database.ts             # TypeScript types
```

## Data Model

```
Logline (1) ───< Comment (N)
```

### Tables

**loglines**
- `id`: UUID PK
- `content`: TEXT (1-140 chars)
- `category`: VARCHAR(50) nullable
- `share_count`: INTEGER default 0
- `comment_count`: INTEGER default 0
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

**comments**
- `id`: UUID PK
- `logline_id`: UUID FK → loglines.id (CASCADE DELETE)
- `content`: TEXT (1-5000 chars)
- `created_at`: TIMESTAMPTZ

## Key Design Decisions

- **No login required**: Users can post loglines anonymously to minimize friction
- **No edit/delete for users**: Posts are immutable to keep things simple
- **Share click count as proxy metric**: Actual SNS share count is too complex to track accurately
- **Comments are append-only**: Users can add supplementary info but cannot edit/delete
- **Admin-only authentication**: Supabase Auth with manual user creation for moderation

## Environment Variables

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
