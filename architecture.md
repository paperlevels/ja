# Paperlevels Architecture

## Overview

Paperlevels is a PoC (Proof of Concept) site where users can post loglines (one-sentence hooks describing a site or product's purpose) without logging in. The share count serves as a proxy metric for demand validation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Next.js Server Actions + Supabase |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (admin only) |
| Hosting | Vercel |
| OGP Preview | microlink.io |

## Project Structure

```
app/
  layout.tsx              # Root layout with Header/Footer
  page.tsx                # Home page (hero, post form, logline list)
  globals.css             # Tailwind CSS theme
  about/
    page.tsx              # About page
  admin/
    layout.tsx            # Admin layout (no auth redirect)
    page.tsx              # Admin dashboard
    login/
      page.tsx            # Admin login page
  p/[id]/
    page.tsx              # Logline detail page

components/
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
  ui/                     # shadcn/ui components

lib/
  actions.ts              # Server Actions
  data.ts                 # Data fetching helpers
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client
    admin.ts              # Admin Supabase client (service role)
    middleware.ts         # Session update helper

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
