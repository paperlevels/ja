# Next.js → Astro 6 + Cloudflare 移行作業記録

## 概要

Paperlevels プロジェクトを Next.js 15 (App Router) から Astro 6 + Cloudflare Workers に移行した作業記録。

---

## 1. プロジェクト構造の移行

### 技術スタック変更

| 項目 | 移行前 | 移行後 |
|------|--------|--------|
| フレームワーク | Next.js 15 (App Router) | Astro 6 |
| レンダリング | SSR (Node.js) | SSR (Cloudflare Workers) |
| スタイリング | Tailwind CSS v4 | Tailwind CSS v4 |
| UI コンポーネント | shadcn/ui | shadcn/ui |
| データベース | Supabase | Supabase |
| ホスティング | Vercel (想定) | Cloudflare Workers |

### ディレクトリ構造変更

```
# 移行前 (Next.js)
app/           # App Router ページ
├── about/
├── admin/
├── p/[id]/
├── layout.tsx
└── page.tsx
components/    # React コンポーネント
lib/           # ユーティリティ・データ取得
├── supabase/
├── actions.ts  # Server Actions
└── data.ts

# 移行後 (Astro)
src/
├── pages/          # Astro ページ (.astro)
│   ├── index.astro
│   ├── p/[id].astro
│   ├── about.astro
│   ├── admin.astro
│   └── admin/login.astro
├── layouts/
│   └── Layout.astro
├── components/     # React 島コンポーネント
├── lib/
│   ├── supabase/
│   ├── data.ts
│   └── utils.ts
└── styles/
    └── global.css
```

---

## 2. Tailwind CSS v4 + shadcn/ui 設定

### global.css

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", "Noto Sans JP", sans-serif;
  --font-mono: "Geist Mono", monospace;
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(240 10% 3.9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(240 10% 3.9%);
  --color-popover: hsl(0 0% 100%);
  --color-popover-foreground: hsl(240 10% 3.9%);
  --color-primary: hsl(240 5.9% 10%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-secondary: hsl(240 4.8% 95.9%);
  --color-secondary-foreground: hsl(240 5.9% 10%);
  --color-muted: hsl(240 4.8% 95.9%);
  --color-muted-foreground: hsl(240 3.8% 46.1%);
  --color-accent: hsl(240 4.8% 95.9%);
  --color-accent-foreground: hsl(240 5.9% 10%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(0 0% 98%);
  --color-border: hsl(240 5.9% 90%);
  --color-input: hsl(240 5.9% 90%);
  --color-ring: hsl(240 5.9% 10%);
  --radius: 0.5rem;
}
```

### Layout.astro での読み込み

```astro
<style is:global>
  @import "@/styles/global.css";
</style>
```

---

## 3. Supabase クライアント移行

### 環境変数変更

| 移行前 | 移行後 |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY`（変更なし） |

### クライアントサイド (src/lib/supabase/client.ts)

```typescript
import { createBrowserClient } from "@supabase/ssr";

const url = (import.meta.env.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";

export function createClient() {
  return createBrowserClient(url, key);
}
```

### サーバーサイド (src/lib/supabase/server.ts)

```typescript
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  const cookies: { name: string; value: string }[] = [];
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    cookies.push({ name: trimmed.slice(0, eqIdx), value: trimmed.slice(eqIdx + 1) });
  }
  return cookies;
}

export interface CookieApi {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptionsWithName) => void;
  delete: (name: string, options: CookieOptionsWithName) => void;
}

export function createClient(request: Request, cookieApi: CookieApi) {
  const cookieHeader = request.headers.get("cookie") || "";
  return createServerClient(url, key, {
    cookies: {
      getAll() { return parseCookieHeader(cookieHeader); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (value === "" || options.maxAge === 0) cookieApi.delete(name, options);
          else cookieApi.set(name, value, options);
        });
      },
    },
  });
}
```

### Admin クライアント (src/lib/supabase/admin.ts)

```typescript
import { createClient } from "@supabase/supabase-js";

const url = (import.meta.env.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function createAdminClient() {
  return createClient(url, serviceRoleKey);
}
```

---

## 4. API Endpoints 移行（Server Actions → API Routes）

### 作成したエンドポイント

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/loglines` | POST | ログライン投稿 |
| `/api/comments` | POST | コメント投稿 |
| `/api/share` | POST | シェア数カウントアップ |
| `/api/admin/delete-logline` | POST | 管理画面：ログライン削除 |
| `/api/admin/delete-comment` | POST | 管理画面：コメント削除 |
| `/api/admin/update-category` | POST | 管理画面：カテゴリ更新 |

### 実装例（src/pages/api/loglines.ts）

```typescript
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { content, category } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("loglines")
      .insert([{ content: content.trim(), category: category || null }])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to create logline" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

---

## 5. .astro ページ作成

### 作成したページ

| ページ | ファイル | 説明 |
|--------|---------|------|
| ホーム | `src/pages/index.astro` | ログライン一覧（ソート・検索） |
| 詳細 | `src/pages/p/[id].astro` | ログライン詳細 + コメント |
| About | `src/pages/about.astro` | サイト説明 |
| 管理画面 | `src/pages/admin.astro` | 認証ガード + 管理ダッシュボード |
| ログイン | `src/pages/admin/login.astro` | 管理者ログイン |

### すべてのページで `prerender = false`

```astro
---
export const prerender = false;
---
```

### 管理画面の認証ガード

```astro
---
const supabase = createClient(Astro.request, {
  get: (name) => Astro.cookies.get(name)?.value,
  set: (name, value, options) => Astro.cookies.set(name, value, options),
  delete: (name, options) => Astro.cookies.delete(name, options),
});

const { data: { user } } = await supabase.auth.getUser();
if (!user) return Astro.redirect("/admin/login");
---
```

---

## 6. React 島コンポーネント移行

### 移行したコンポーネント

| コンポーネント | 変更点 |
|--------------|--------|
| `Header.tsx` | `next/link` → `<a>` タグ |
| `LoglineCard.tsx` | `next/link` → `<a>` タグ |
| `LoglineForm.tsx` | `fetch('/api/loglines')` に変更 |
| `ShareButton.tsx` | `fetch('/api/share')` に変更 |
| `CommentForm.tsx` | `fetch('/api/comments')` に変更 |
| `sonner.tsx` | `next-themes` → `MutationObserver` でダークモード検知 |
| `AdminLoginForm.tsx` | `useRouter` → `window.location.href` |
| `AdminDashboard.tsx` | `fetch()` で管理APIを呼び出し |

### sonner.tsx のテーマ対応変更

```typescript
// next-themes からの移行
useEffect(() => {
  const html = document.documentElement;
  const observer = new MutationObserver(() => {
    setTheme(html.classList.contains("dark") ? "dark" : "light");
  });
  observer.observe(html, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}, []);
```

---

## 7. ダークモード・テーマ対応

### Layout.astro でのテーマ初期化

```astro
<script is:inline>
  (function () {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  })();
</script>
```

---

## 8. Cloudflare Workers デプロイ設定

### astro.config.mjs

```javascript
import { defineConfig, sessionDrivers } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  session: {
    driver: sessionDrivers.memory(),
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        "@base-ui/react",
        "@base-ui/react/*",
        "@supabase/supabase-js",
        "@supabase/ssr",
      ],
    },
  },
});
```

### wrangler.toml

```toml
name = "paperlevels"
compatibility_date = "2026-06-08"

[vars]
# PUBLIC_ プレフィックスの環境変数
# PUBLIC_SUPABASE_URL = "https://xxxxxx.supabase.co"
# PUBLIC_SUPABASE_ANON_KEY = "eyJ..."

# 機密情報は wrangler secret を使用
# wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

---

## 9. @cloudflare/vite-plugin 互換性パッチ

### 問題

`@astrojs/cloudflare` v13.0.0 にバンドルされている `@cloudflare/vite-plugin` v1.40.0 が、Astro 6 のビルドプロセスと互換性に問題がありました：

1. `astro build` 時に Astro が一時的な Vite サーバーを作成する際、Cloudflare プラグインが `workerd` ランタイムを起動しようとする
2. `CloudflareDevEnvironment.listen()` で WebSocket が未定義の場合にエラー
3. Vite 7 の `rolldownVersion` 検出により `rolldownOptions.input` が設定されるが、Vite の `resolveRollupOptions` は `rollupOptions.input` を参照するため、エントリポイントが見つからない

### 適用したパッチ

**Patch 1: configureServer で一時的な sync サーバーをスキップ**

```javascript
async configureServer(viteDevServer) {
  assertIsNotPreview(ctx);
  if (viteDevServer.config.server.ws === false || viteDevServer.config.server.hmr === false) return;
  // ...
}
```

**Patch 2: CloudflareDevEnvironment.listen() で WebSocket 未初期化時をスキップ**

```javascript
async listen() {
  if (!this.#webSocketContainer.webSocket) return;
  return super.listen();
}
```

**Patch 3: rollupOptions を常に設定**

`isRolldown` が true の場合に `rolldownOptions` のみが設定され、`rollupOptions` が空になる問題を修正。両方を設定するように変更：

```javascript
build: {
  // ...
  rollupOptions,
  ...isRolldown ? { rolldownOptions: { ... } } : {}
}
```

### パッチの永続化

`patch-package` を使用して `patches/@cloudflare+vite-plugin+1.40.0.patch` として保存し、`package.json` の `postinstall` スクリプトで自動適用されるように設定。

---

## 10. ビルド出力構造

```
dist/
├── client/           # 静的アセット
│   ├── _astro/       # ビルドされた JS/CSS
│   ├── .assetsignore
│   └── *.svg
└── server/           # Cloudflare Workers コード
    ├── entry.mjs     # エントリーポイント
    ├── wrangler.json # Cloudflare 設定
    ├── .dev.vars
    └── chunks/       # チャンクファイル
```

---

## 11. デプロイ手順

```bash
# ビルド
npm run build

# 機密情報の設定（初回のみ）
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# デプロイ
npx wrangler deploy
```

---

## 備考

- すべてのページで `export const prerender = false` を設定
- `@base-ui/react` は `ssr.noExternal` に追加して SSR バンドルに含める
- `workerd` バイナリは実行環境に依存するため、`patch-package` によるパッチ適用が必須
