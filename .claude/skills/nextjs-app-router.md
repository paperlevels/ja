# Next.js App Router

This project uses Next.js 16 with the App Router.

## Key Conventions

- Server Components are the default
- Use `"use client"` for Client Components that need interactivity
- Server Actions go in separate files with `"use server"` at the top
- Data fetching happens in Server Components via `async/await`
- Use `revalidatePath()` from `next/cache` to invalidate cached data
- Dynamic routes use `[param]` syntax

## Important Notes

- `cookies()` from `next/headers` is async in Next.js 15+
- `searchParams` and `params` in page components are Promises
- Use `export const dynamic = "force-dynamic"` for pages that need fresh data on every request
- The `proxy.ts` file (previously `middleware.ts`) handles session updates with `@supabase/ssr`
