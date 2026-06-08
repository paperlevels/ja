# Supabase テスト仕様

## 1. 方針

Supabase のテストは以下の 3 レイヤーに分けて実施する。

| レイヤー | 対象 | 目的 | 推奨ツール |
|---------|------|------|-----------|
| Database | RLS ポリシー、関数、トリガー | データアクセス制御と DB ロジックの検証 | `supabase test db` (pgTAP) |
| API / Integration | Client 経由の CRUD、認証付き操作 | 実際の API 呼び出しとレスポンスの検証 | `vitest` + `@supabase/supabase-js` |
| E2E | 画面操作 → DB 反映 | ユーザーフロー全体の検証 | `Playwright` |

## 2. 環境

- **ローカル / CI 共用**: Supabase CLI の Docker 環境 (`supabase start`) を使用し、本番とは完全に分離する。
- **初期化**: 各テスト実行前に `supabase db reset` を行い、スキーマと seed データを同じ状態に戻す。

## 3. 必須テスト項目

### 3.1 RLS ポリシー（最重要）

Supabase の安全性は RLS に依存するため、以下のパターンを必ず網羅する。

```typescript
// 例: 匿名ユーザーは投稿できない
test('匿名ユーザーは loglines に insert できない', async () => {
  const { error } = await anonClient.from('loglines').insert({ title: 'test' });
  expect(error).not.toBeNull();
});

// 例: 一般ユーザーは自分の投稿のみ更新できる
test('一般ユーザーは他人の投稿を更新できない', async () => {
  const { error } = await userAClient
    .from('loglines')
    .update({ title: 'hacked' })
    .eq('id', userBLoglineId);
  expect(error).not.toBeNull();
});

// 例: 管理者のみが削除できる
test('一般ユーザーは delete できない', async () => {
  const { error } = await userClient.from('loglines').delete().eq('id', 1);
  expect(error).not.toBeNull();
});
```

### 3.2 CRUD 操作

- 正常系: 作成・取得・更新・削除が期待通り動作する
- 異常系: バリデーションエラー、存在しない ID へのアクセス、重複制約違反

### 3.3 Auth フロー

- サインアップ / サインイン / サインアウト
- セッションの有効期限とリフレッシュ
- パスワードリセット（必要に応じて）

## 4. テストデータ管理

- `supabase/seed.sql` にテスト用ユーザーや fixture データを定義する。
- テスト毎に `db reset` でクリーンな状態を再現する。
- テスト内で動的に作成したデータは、テスト終了時に削除するか、reset に委ねる。

## 5. CI 連携

```yaml
# 例: GitHub Actions
- name: Start Supabase
  run: npx supabase start
- name: Run DB tests
  run: npx supabase test db
- name: Run integration tests
  run: npx vitest run
```

## 6. 導入手順（本プロジェクト）

1. `npm install -D supabase` で CLI を導入
2. `supabase/config.toml` でローカル環境を設定
3. `.env.test` を作成し、`SUPABASE_URL=http://localhost:54321` 等を設定
4. `__tests__/supabase.integration.test.ts` を作成して RLS + CRUD テストを記述
5. `package.json` にテスト用スクリプトを追加:
   ```json
   "test:db": "supabase test db",
   "test:integration": "vitest run __tests__/supabase.integration.test.ts"
   ```

## 7. 命名規則

- テストファイル: `{対象}.test.ts` または `{対象}.spec.ts`
- テストケース: `【状況】を【操作】すると【結果】になる` の形式で記述
