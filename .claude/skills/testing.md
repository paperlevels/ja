# Testing

This project uses Vitest for unit/integration coverage and Playwright for E2E coverage.

## Vitest

- Run the full suite with `npm run test`
- Use `npm run test:ui` when interactive inspection is useful
- Run a single file with `npm exec vitest run tests/api/loglines.test.ts`
- Test files live under `tests/**/*.test.ts`

## Playwright

- Run the full E2E suite with `npm run test:e2e`
- Run a single spec with `npx playwright test e2e/post-logline.spec.ts`
- Specs live under `e2e/*.spec.ts`

## Test Data

- Prefer `uniqueTestContent()` from `tests/helpers.ts` for unique rows
- Clean up inserted rows with the helper functions in `tests/helpers.ts`
- `tests/setup.ts` loads `.env.local`, so Supabase credentials are required for DB-backed tests

## Practical Notes

- Keep tests deterministic and isolate DB state
- If a change touches API routes, update the corresponding Vitest coverage first
- If a change touches user flows, verify the matching Playwright spec
