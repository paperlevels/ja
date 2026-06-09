# Cloudflare Workers & Pages へのデプロイガイド

このプロジェクトは Cloudflare Workers（または Pages）にデプロイし、Supabase と連携して動作します。

---

## 必要な環境変数

Supabase への接続には以下の 3 つの環境変数が必要です。

| 変数名 | 用途 | 公開/秘密 |
|--------|------|-----------|
| `PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL | 公開（`PUBLIC_` プレフィックス必須） |
| `PUBLIC_SUPABASE_ANON_KEY` | クライアントサイド・サーバーサイド両方で使用 | 公開（`PUBLIC_` プレフィックス必須） |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理 API などサーバーサイド専用 | **秘密** |

> **注意**: `SUPABASE_SERVICE_ROLE_KEY` は強力な権限を持つため、絶対にクライアントサイドに公開しないでください。

---

## Astro の env スキーマ

`astro.config.mjs` で以下のように環境変数スキーマが定義されています。Astro はビルド時にこれらの変数を検証し、`astro:env/client` および `astro:env/server` から型安全に読み込めます。

```js
env: {
  schema: {
    PUBLIC_SUPABASE_URL: envField.string({ context: "client", access: "public" }),
    PUBLIC_SUPABASE_ANON_KEY: envField.string({ context: "client", access: "public" }),
    SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: "server", access: "secret" }),
  },
},
```

---

## Cloudflare Workers にデプロイする場合

### 公開環境変数の設定

`wrangler.toml` の `[vars]` セクションに公開環境変数を記述します。

```toml
[vars]
PUBLIC_SUPABASE_URL = "https://xxxxxx.supabase.co"
PUBLIC_SUPABASE_ANON_KEY = "eyJ..."
```

### 機密情報の設定

`SUPABASE_SERVICE_ROLE_KEY` は `wrangler secret` コマンドで設定します。

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### ビルドとデプロイ

```bash
npm run build
npx wrangler deploy
```

---

## Cloudflare Pages にデプロイする場合

### 方法 A: Pages ダッシュボードから設定

1. [Cloudflare Dashboard](https://dash.cloudflare.com) で Pages プロジェクトを選択
2. **「Settings」** → **「Environment variables」** を開く
3. 以下の環境変数を追加します
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Production** 環境と **Preview** 環境の両方に設定してください

### 方法 B: `wrangler.toml` を使用

Workers と同様に `wrangler.toml` で `[vars]` に公開変数を設定し、以下のコマンドで秘密情報を登録することもできます。

```bash
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
```

### ビルドとデプロイ

```bash
npm run build
# dist/ ディレクトリをデプロイ
npx wrangler pages deploy dist/
```

---

## Supabase クライアントの初期化

このプロジェクトでは以下のように環境変数を通じて Supabase クライアントを初期化しています。

### ブラウザ（クライアントサイド）

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "astro:env/client";

export function createClient() {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
```

### サーバーサイド（Admin）

```typescript
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL } from "astro:env/client";
import { SUPABASE_SERVICE_ROLE_KEY } from "astro:env/server";

export function createAdminClient() {
  return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
```

---

## トラブルシューティング

### Build failed: `EnvInvalidVariables`

以下のようなビルドエラーが出る場合の対処法です。

```text
[EnvInvalidVariables] [astro-env-plugin] Could not load astro:env/client: The following environment variables defined in `env.schema` are invalid:
- PUBLIC_SUPABASE_URL is missing
- PUBLIC_SUPABASE_ANON_KEY is missing
```

#### エラーの原因

Astro はビルド時に `env.schema` で定義された変数を検証します。`client` コンテキストの変数（`PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`）は**ビルド時に必須**です。Cloudflare Pages のビルド環境では `.env.local` が読み込まれないため、ビルド時に環境変数が供給されていないと即座に失敗します。

> 補足: `SUPABASE_SERVICE_ROLE_KEY`（`server` / `secret`）はこのエラーに出ていません。これはサーバーサイド専用の秘密変数なので、**ビルド時ではなく実行時** に必要となるためです。

#### 解決方法

**方法 1: Cloudflare Dashboard で環境変数を設定する（推奨）**

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages プロジェクトを開く
2. **「Settings」** → **「Environment variables」**
3. **Production** 環境と **Preview** 環境の両方に以下を追加
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. 再デプロイ（ビルドキャッシュもクリアしておくと確実）

**方法 2: `wrangler.toml` に公開変数を書く**

リポジトリに含めても問題ない値であれば、`wrangler.toml` に直接記載できます。

```toml
[vars]
PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
PUBLIC_SUPABASE_ANON_KEY = "eyJ..."
```

**方法 3: ビルドコマンドで一時的に注入する（緊急回避）**

```json
"build": "PUBLIC_SUPABASE_URL=https://... PUBLIC_SUPABASE_ANON_KEY=eyJ... astro build"
```

---

### Cloudflare Settings（Variables and secrets）の確認

以下のような設定が正しいか確認してください。

| 変数名 | タイプ | 評価 |
|--------|--------|------|
| `PUBLIC_SUPABASE_ANON_KEY` | Plaintext | ✅ 正しい（クライアントに公開されるキー） |
| `PUBLIC_SUPABASE_URL` | Plaintext | ✅ 正しい（URL は秘密ではない） |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ✅ 正しい（絶対に Secret にする） |

#### 注意点: 「ビルド時」と「ランタイム」

Cloudflare Dashboard の **「Variables and secrets」** は **ランタイム**（デプロイ後の実行環境）で使用されます。先ほどのビルドエラーは **ビルド時**（`npm run build` 実行中）の問題です。

- **Cloudflare Pages** の場合: Dashboard の Environment variables は通常、ビルド時にも渡されます。しかし古いプロジェクトや特定の設定では分かれていることがあるため、ビルドエラーが続く場合は **Build variables** の有無も確認してください。
- **Cloudflare Workers** の場合: ローカルで `npm run build` を実行するため、ローカルの `.env.local` または CI の環境変数でビルド時に値を供給してください。

#### 再デプロイ時のチェックリスト

- [ ] `PUBLIC_SUPABASE_URL` と `PUBLIC_SUPABASE_ANON_KEY` が **Production** と **Preview** の両方に設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` は **Secret** タイプで設定されている
- [ ] 再デプロイ時にビルドキャッシュをクリアしている
