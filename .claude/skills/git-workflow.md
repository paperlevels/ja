# Git Workflow

## Commit Policy

### Always commit

- Source code changes (`src/`, `components/`, `lib/`, `types/`)
- Configuration changes (`astro.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, etc.)
- Dependency changes (`package.json`, `package-lock.json`)
- Database schema (`supabase/schema.sql`)
- Agent configurations (`.claude/`, `.kimi/`, `.agents/`, `.mcp.json`, `.claudeignore`)

### Never commit

- `.env*` files (contain secrets)
- Build outputs (`.astro/`, `dist/`, `build/`)
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

## Branch Creation

- **Never create a new branch** unless the user explicitly instructs you to do so.
- Do not create branches with auto-generated names like `codex/test-suite`, `codex/cli`, `agent/...`, etc.
- Always work on the currently checked-out branch. If you are on `main`, commit directly to `main`.

## Pull Requests

- **Never open a pull request automatically** or without explicit user instruction.
- If the user asks to push directly or says they do not want the extra PR step, follow that instruction exactly.
- Do not convert a direct-push request into a PR workflow.

## Push

Push directly to the current branch (`main` or otherwise) unless the user explicitly asks for a different workflow.

- commit the intended changes
- push the main branch directly
- do not open a pull request unless the user explicitly asks for one

Prefer the shortest publish flow that satisfies the user's request.
