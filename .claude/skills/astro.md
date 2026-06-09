# Astro 6 + Cloudflare Workers

This project uses Astro 6 with the Cloudflare Workers adapter.

## Key Conventions

- All pages live in `src/pages/` and use `.astro` files
- Set `export const prerender = false` for SSR pages (dynamic data)
- API routes are `.ts` files under `src/pages/api/`
- React components are used as islands with `client:*` directives (e.g., `client:load`, `client:only="react"`)
- Data fetching happens in the frontmatter (`---`) of `.astro` files via `async/await`
- Use `Astro.request`, `Astro.cookies`, `Astro.redirect`, etc. from the `Astro` global

## Important Notes

- Environment variables must use the `PUBLIC_` prefix to be exposed to the client; access them via `import.meta.env.PUBLIC_*`
- The Cloudflare Workers adapter requires `output: "server"` in `astro.config.mjs`
- `@base-ui/react` and `@supabase/*` packages must be listed in `vite.ssr.noExternal` to be bundled for SSR
- Session handling is implemented in `src/lib/supabase/server.ts` and the API routes; keep cookie reads and writes aligned with the existing helper wrappers
- Build outputs go to `dist/` (server entry at `dist/server/entry.mjs`)
