# Paperlevels

ログラインで需要を測るPoCサイト。

## Tech Stack

- Astro 6
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (PostgreSQL + Auth)
- Cloudflare Workers（デプロイ先）

## Getting Started

### 1. Supabase プロジェクトを作成する

1. [https://supabase.com](https://supabase.com) にアクセスし、アカウントを作成（またはログイン）
2. Dashboard で **「New Project」** をクリック
3. **Organization** を選択（または作成）
4. 以下を入力して **「Create new project」** をクリック
   - **Name**: `paperlevels`（任意）
   - **Database Password**: 強固なパスワードを入力（後で確認する機会はないので必ず控えておく）
   - **Region**: `Tokyo (ap-northeast-1)` など、地理的に近いリージョンを選択
5. プロジェクトの作成には1〜2分かかります

### 2. データベース（テーブル）を作成する

1. プロジェクトの Dashboard が表示されたら、左メニューから **「SQL Editor」** を開く
2. **「New query」** をクリック
3. エディタに、このプロジェクトの `supabase/schema.sql` の内容をすべてコピー＆ペーストする
   - ファイルの内容は以下のコマンドで確認できる:
   ```bash
   cat supabase/schema.sql
   ```
4. エディタ下部の **「Run」** ボタンをクリックして実行
5. 実行結果に `success` と表示されればOK

### 3. 環境変数を取得する

#### 3a. Project URL を取得

1. Supabase Dashboard の左メニューから **「Settings」**（歯車アイコン）を開く
2. サイドメニューから **「Data API」** を選択
3. **「Project URL」** の値をコピー（`PUBLIC_SUPABASE_URL`）

#### 3b. API Keys（Anon Key / Service Role Key）を取得

1. 同じ **「Settings」** メニュー内で **「API Keys」** を選択
2. **`anon` `public`** の値をコピー（`PUBLIC_SUPABASE_ANON_KEY`）
3. 同じページ内で **`service_role` `secret`** の値をコピー（`SUPABASE_SERVICE_ROLE_KEY`）

> **注意**: `service_role` キーは強力な権限を持つため、絶対に公開しないでください。

### 4. `.env.local` を作成する

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、先ほどコピーした値を貼り付けます。

```bash
# ターミナルで以下を実行（値は各自のものに置き換えてください）
cat > .env.local << 'EOF'
PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
EOF
```

または、任意のテキストエディタで `.env.local` ファイルを新規作成しても構いません。

### 5. 依存関係をインストール

```bash
npm install
```

### 6. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:4321](http://localhost:4321) を開きます。

## テストの実行

このプロジェクトでは、Vitest で API / DB / データ層のテストを、Playwright で E2E テストを実行します。

### Unit / Integration テスト

```bash
npm run test
```

UI で確認したい場合:

```bash
npm run test:ui
```

個別に実行する場合の例:

```bash
npm exec vitest run tests/api/loglines.test.ts
```

### E2E テスト

```bash
npm run test:e2e
```

特定ファイルだけ実行する場合の例:

```bash
npx playwright test e2e/post-logline.spec.ts
```

> 注意: API / DB / 一部の E2E テストは Supabase の接続情報が必要です。`.env.local` を用意してから実行してください。

---

## Admin Setup（管理画面のログイン設定）

管理画面（`/admin`）へアクセスするには、Supabase Auth に管理者ユーザーを登録する必要があります。

1. Supabase Dashboard の左メニューから **「Authentication」** を開く
2. タブから **「Users」** を選択
3. **「Add user」** または **「Invite」** をクリック
4. メールアドレスとパスワードを入力してユーザーを作成
   - 例: Email: `admin@example.com`, Password: 任意のパスワード
5. 作成したメールアドレスとパスワードで、[http://localhost:4321/admin](http://localhost:4321/admin) からログイン

> **補足**: 現状は一般ユーザー登録フォームは設置していません。必要に応じて Supabase Dashboard から手動でユーザーを追加してください。

---

## Cloudflare へのデプロイと Supabase 接続

このプロジェクトは Cloudflare Workers（または Pages）にデプロイし、Supabase と連携して動作します。

### 必要な環境変数

Supabase への接続には以下の 3 つの環境変数が必要です。

| 変数名 | 用途 | 公開/秘密 |
|--------|------|-----------|
| `PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL | 公開（`PUBLIC_` プレフィックス必須） |
| `PUBLIC_SUPABASE_ANON_KEY` | クライアントサイド・サーバーサイド両方で使用 | 公開（`PUBLIC_` プレフィックス必須） |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理 API などサーバーサイド専用 | **秘密** |

> **注意**: `SUPABASE_SERVICE_ROLE_KEY` は強力な権限を持つため、絶対にクライアントサイドに公開しないでください。

### Astro の env スキーマ

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

### 1. Cloudflare Workers にデプロイする場合

#### 公開環境変数の設定

`wrangler.toml` の `[vars]` セクションに公開環境変数を記述します。

```toml
[vars]
PUBLIC_SUPABASE_URL = "https://xxxxxx.supabase.co"
PUBLIC_SUPABASE_ANON_KEY = "eyJ..."
```

#### 機密情報の設定

`SUPABASE_SERVICE_ROLE_KEY` は `wrangler secret` コマンドで設定します。

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

#### ビルドとデプロイ

```bash
npm run build
npx wrangler deploy
```

### 2. Cloudflare Pages にデプロイする場合

#### 方法 A: Pages ダッシュボードから設定

1. [Cloudflare Dashboard](https://dash.cloudflare.com) で Pages プロジェクトを選択
2. **「Settings」** → **「Environment variables」** を開く
3. 以下の環境変数を追加します
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Production** 環境と **Preview** 環境の両方に設定してください

#### 方法 B: `wrangler.toml` を使用

Workers と同様に `wrangler.toml` で `[vars]` に公開変数を設定し、以下のコマンドで秘密情報を登録することもできます。

```bash
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
```

#### ビルドとデプロイ

```bash
npm run build
# dist/ ディレクトリをデプロイ
npx wrangler pages deploy dist/
```

### Supabase クライアントの初期化

このプロジェクトでは以下のように環境変数を通じて Supabase クライアントを初期化しています。

#### ブラウザ（クライアントサイド）

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "astro:env/client";

export function createClient() {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
```

#### サーバーサイド（Admin）

```typescript
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL } from "astro:env/client";
import { SUPABASE_SERVICE_ROLE_KEY } from "astro:env/server";

export function createAdminClient() {
  return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
```

---

## Features

- ログイン不要でログラインを投稿
- シェア数に基づく人気順 / 新着順のソート
- キーワード検索
- SNSシェア機能（Web Share API / X Intent）
- コメント機能（Markdown対応）
- コメント内URLのOGPプレビュー（microlink.io）
- 管理画面（認証・削除・カテゴリ編集）
