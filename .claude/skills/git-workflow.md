# Git Workflow

## Commit Policy

### Always commit & push

- Source code changes (`app/`, `components/`, `lib/`, `types/`)
- Configuration changes (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, etc.)
- Dependency changes (`package.json`, `package-lock.json`)
- Database schema (`supabase/schema.sql`)
- Agent configurations (`.claude/`, `.kimi/`, `.agents/`, `.mcp.json`, `.claudeignore`)

### Never commit

- `.env*` files (contain secrets)
- Build outputs (`.next/`, `out/`, `build/`)
- `node_modules/`
- `*.tsbuildinfo`

## Commit Messages

Use English.

Format: `<type>: <description>`

Types:
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change that neither fixes a bug nor adds a feature
- `style:` formatting, missing semicolons, etc.
- `docs:` documentation only changes
- `chore:` updating build tasks, package manager configs, etc.

Examples:
- `feat: add comment sorting by oldest first`
- `fix: resolve share count increment bug`
- `refactor: extract comment list component`

## Push

Push directly to `main` branch unless otherwise instructed.
