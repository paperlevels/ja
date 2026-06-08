# Next.js → Astro v6 + Cloudflare Workers & Pages 移行検討書

## 結論

**可能ですが、かなりの変更が必要です。**

特に **React 19 ↔ Astro v6 + Cloudflare Workers** という組み合わせは、いくつかの重大な制約と書き換えが必要です。

---

## 1. 現在の技術スタックと依存

| 要素 | 現在 | Astro 6 + CF Workers 移行時の影響 |
|------|------|-----------------------------------|
| **Next.js 16** App Router | ◎ | → フレームワークごと置き換え |
| **React 19** | ◎ | → Astro内で `client:*` ディレクティブ必要 |
| **Tailwind CSS v4** | ◎ | → Astro公式対応あり、ほぼそのまま可 |
| **shadcn/ui** | ◎ | → 個別コンポーネントは流用可だが `cn()` 等調整必要 |
| **Supabase (SSR + Auth)** | ◎ | → **最大の難所。`@supabase/ssr` + CookieがCF Workersで動くか要注意** |
| **Next.js Server Actions** | `"use server"` | → Astroでは存在しない。**API Endpoints (`*.ts`) に書き換え必須** |
| **`next/font/google`** | Inter, Geist_Mono | → Astroでは別方式（`<link>` or `fontsource`） |
| **`next/link`** | 複数箇所 | → `<a>` タグへ書き換え |
| **`useRouter()` / `redirect()`** | 複数 | → Astroの `Astro.redirect()` / `navigate()` へ書き換え |
| **`next-themes`** | sonner連携 | → Astroでは別途ダークモード実装が必要 |
| **`react-markdown`** | コメント表示 | → そのままReact島で使える |

---

## 2. 各機能の移行可否と工数

### ◎ 比較的楽に移行できるもの

- **静的ページ（`/about`）** → Astroの `.astro` テンプレートにほぼそのまま変換可
- **UIコンポーネント（Tailwind + shadcn）** → React島として流用可能
- **OGPプレビュー（microlink.io呼び出し）** → クライアント側fetchなのでそのまま
- **Markdownレンダリング** → `react-markdown` をReact島として継続使用可

### ⚠️ 書き換えが必要だが対応可能なもの

| 機能 | 現在 | Astro化 |
|------|------|---------|
| **一覧ページ（`/`）** | `async` Server Component + `searchParams` | Astroの `Astro.url.searchParams` + `getLoglines()` 呼び出し |
| **詳細ページ（`/p/[id]`）** | `async` Server Component | `src/pages/p/[id].astro` + `getLoglineById()` |
| **レイアウト** | `app/layout.tsx` | `src/layouts/Layout.astro` |
| **管理画面UI** | `async` Server Component + テーブル | React島 + APIフェッチに変更 |

### ❌ 大幅な作り直しが必要なもの

#### (1) Server Actions → API Endpoints（最重要）

現在 `lib/actions.ts` の `"use server"` 関数は、**Astroには存在しません**。

```typescript
// 現在（Next.js）
"use server";
export async function createLogline(formData: FormData) { ... }
```

```typescript
// 移行後（Astro）src/pages/api/loglines.ts
export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  // ... Supabase処理
  return new Response(JSON.stringify({ success: true }), ...);
};
```

**6つのServer Actionすべて**をAPI Endpointに書き換え、フロント側は `fetch()` で呼び出す必要があります。

#### (2) Supabase Auth + Cookie（管理画面）

現在の `@supabase/ssr` + `next/headers` のクッキー連携は、**Cloudflare Workers上での動作検証が必要**です。

```typescript
// 現在
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
```

Astro + Cloudflare Workersでは：
- `Astro.cookies`（Astro組み込み）を使う
- あるいは `@supabase/ssr` が Workers ランタイム（`workerd`）で動作するか確認
- `SUPABASE_SERVICE_ROLE_KEY` は環境変数として Workers に設定

**懸念**: `@supabase/ssr` が Cloudflare Workers の `Request`/`Response` オブジェクトと正しく連携するかは未検証箇所です。

#### (3) `next-themes` + `sonner`

`sonner.tsx` は `next-themes` の `useTheme()` に依存しています。Astroでは：
- `next-themes` は使用不可（Next.js専用）
- ダークモードは自前実装 or `astro-themes` 等の代替
- `sonner` 自体は使えますが、テーマ連携部分を書き換え必要

#### (4) `revalidatePath`（ISR/キャッシュ）

Next.jsの `revalidatePath("/")` はAstroに相当機能がありません。SSRモードでは毎回DB問い合わせになります。

---

## 3. Cloudflare Workers & Pages 特有の制約

| 制約 | 影響 |
|------|------|
| **Node.js API 非対応** | `fs`, `path` 等使えない（今回は影響小） |
| **Request/Response API** | Supabaseクライアントの初期化方法を調整必要 |
| **環境変数** | `.env.local` → `wrangler.toml` / CFダッシュボード |
| **Service Role Key の管理** | Workers環境変数として安全に設定可能 |
| **D1 / KV 等** | 今回はSupabaseを継続使用するので不要 |

---

## 4. 推定工数（ボールパーク）

| 作業項目 | 工数目安 |
|---------|---------|
| Astroプロジェクト初期化 + Tailwind設定 | 1-2h |
| ページ構造移行（`.astro`テンプレート作成） | 4-6h |
| Server Actions → API Endpoints（6個） | 4-6h |
| React島への分離（`client:load`/`client:idle`調整） | 3-4h |
| Supabase Auth + Cookie連携の検証・実装 | 3-5h（**もっとも不確実**） |
| `next-themes` → 自前ダークモード | 1-2h |
| `next/link`, `useRouter` 等の書き換え | 2-3h |
| Cloudflare Workers デプロイ設定 | 1-2h |
| 動作検証・デバッグ | 3-5h |
| **合計** | **約 22-35h** |

---

## 5. 移行のメリット・デメリット

| メリット | デメリット |
|---------|-----------|
| Cloudflareエッジでの高速配信 | 大幅な書き換え工数 |
| ホスティングコスト削減（Pagesは無料帯域広） | React 19 ↔ Astro 6 の互換性リスク |
| Next.jsの複雑性からの解放 | Server Actions消失による `fetch` ベースへの回帰 |
| 静的生成とSSRのハイブリッドが明快 | Supabase Auth連携の再検証必要 |

---

## 6. 推奨方針

もし本当に移行するなら、以下の順序が安全です：

1. **まずAstroの開発モード（Node.js）で完璧に動かす**
2. **その後Cloudflare Workersアダプタを適用**
3. **Supabase Auth周りはローカルで十分検証してからデプロイ**

---

## 補足：React 19 の懸念

Astro v6はReact 19に対応していますが、**React 19の新機能（Server Components, Actions, `use` API等）** はAstroの概念と重複・競合する部分があります。今回のコードは比較的古典的なReact Hooks使用が多いので影響は小さいですが、`use client` / `use server` の境界を全部見直す必要があります。

---

## 要約

> **技術的には可能ですが、フレームワークの乗り換えに伴う「概念の翻訳」が多く、工数は実質的に「半作り直し」に近いです。** Server Actionsの消失とSupabase AuthのCookie連携が最大の壁になります。
