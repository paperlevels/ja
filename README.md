# Paperlevels

ログラインで需要を測るPoCサイト。

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth)

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
3. **「Project URL」** の値をコピー（`NEXT_PUBLIC_SUPABASE_URL`）

#### 3b. API Keys（Anon Key / Service Role Key）を取得

1. 同じ **「Settings」** メニュー内で **「API Keys」** を選択
2. **`anon` `public`** の値をコピー（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
3. 同じページ内で **`service_role` `secret`** の値をコピー（`SUPABASE_SERVICE_ROLE_KEY`）

> **注意**: `service_role` キーは強力な権限を持つため、絶対に公開しないでください。

### 4. `.env.local` を作成する

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、先ほどコピーした値を貼り付けます。

```bash
# ターミナルで以下を実行（値は各自のものに置き換えてください）
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
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

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## Admin Setup（管理画面のログイン設定）

管理画面（`/admin`）へアクセスするには、Supabase Auth に管理者ユーザーを登録する必要があります。

1. Supabase Dashboard の左メニューから **「Authentication」** を開く
2. タブから **「Users」** を選択
3. **「Add user」** または **「Invite」** をクリック
4. メールアドレスとパスワードを入力してユーザーを作成
   - 例: Email: `admin@example.com`, Password: 任意のパスワード
5. 作成したメールアドレスとパスワードで、[http://localhost:3000/admin](http://localhost:3000/admin) からログイン

> **補足**: 現状は一般ユーザー登録フォームは設置していません。必要に応じて Supabase Dashboard から手動でユーザーを追加してください。

---

## Features

- ログイン不要でログラインを投稿
- シェア数に基づく人気順 / 新着順のソート
- キーワード検索
- SNSシェア機能（Web Share API / X Intent）
- コメント機能（Markdown対応）
- コメント内URLのOGPプレビュー（microlink.io）
- 管理画面（認証・削除・カテゴリ編集）
