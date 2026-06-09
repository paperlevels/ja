# E2E

Run the Playwright end-to-end suite.

```bash
npm run test:e2e
```

Run a single spec when iterating:

```bash
npx playwright test e2e/post-logline.spec.ts
```

These tests may require `.env.local` with Supabase credentials.
