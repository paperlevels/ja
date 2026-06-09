# Paperlevels SEO & AIO 施策仕様書

## 1. 現状分析

| 項目 | 現状 | 課題 |
|------|------|------|
| OGP / Twitter Cards | 未実装 | SNSシェア時の表示が不十分 |
| Canonical URL | 未設定 | 重複URL（ソートパラメータ等）で評価分散リスク |
| robots.txt / sitemap.xml | 未作成 | クローラー誘導・インデックス効率が低い |
| 構造化データ（JSON-LD） | 未導入 | リッチスニペット表示不可、AI要約精度低下 |
| `site` 設定（astro.config） | 未設定 | canonical・sitemap生成に必須 |
| メタタグ | title/description のみ | robots、OGP、Twitter Card 欠如 |
| ページ構成 | SSR（prerender=false）全ページ | レンダリング速度・キャッシュ効率に課題 |

---

## 2. 施策一覧

### Phase 1: 基盤整備（即効性・高優先）

#### 2.1 `site` 設定の追加
```js
// astro.config.mjs
export default defineConfig({
  site: "https://ja.paperlevels.workers.dev", // 実際のドメインに置き換え
  // ...
});
```

#### 2.2 SEO コンポーネントの作成
`src/components/SEO.astro` を新規作成し、全ページで使用する。

```astro
---
export interface Props {
  title: string;
  description: string;
  ogType?: "website" | "article";
  ogImage?: string;
  canonicalPath?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const {
  title,
  description,
  ogType = "website",
  ogImage = "/ogp-default.png",
  canonicalPath,
  noindex = false,
  jsonLd,
} = Astro.props;

const canonicalUrl = canonicalPath
  ? new URL(canonicalPath, Astro.site).toString()
  : new URL(Astro.url.pathname, Astro.site).toString();
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />
{noindex && <meta name="robots" content="noindex, nofollow" />}

<!-- OGP -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
<meta property="og:site_name" content="Paperlevels" />
<meta property="og:locale" content="ja_JP" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(ogImage, Astro.site).toString()} />

<!-- JSON-LD -->
{jsonLd && (
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
)}
```

#### 2.3 robots.txt の作成
```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login/
Disallow: /api/

Sitemap: https://ja.paperlevels.workers.dev/sitemap.xml
```

#### 2.4 sitemap.xml の動的生成
`/pages/sitemap.xml.ts` を作成し、ログライン一覧・個別ページの URL を動的出力する。

```ts
import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";

export const GET: APIRoute = async () => {
  const { data: loglines } = await supabase
    .from("loglines")
    .select("id, updated_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const urls = [
    { loc: "/", lastmod: new Date().toISOString(), priority: "1.0" },
    { loc: "/about", lastmod: new Date().toISOString(), priority: "0.5" },
    ...(loglines?.map((l) => ({
      loc: `/p/${l.id}`,
      lastmod: l.updated_at ?? new Date().toISOString(),
      priority: "0.8",
    })) ?? []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>https://ja.paperlevels.workers.dev${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
```

#### 2.5 各ページへの SEO 適用

| ページ | title | description | ogType | noindex |
|--------|-------|-------------|--------|---------|
| `/` | Paperlevels - ログラインで需要を測る | 1文から始まる物語。ログラインを投稿して、読者の反応を測ろう。 | website | false |
| `/p/[id]` | {ログライン本文}｜Paperlevels | {カテゴリ名}のログライン。{コメント数}件のコメント・{シェア数}回のシェア。 | article | false |
| `/about` | About｜Paperlevels | Paperlevelsとは、1文から始まる物語の実験場です。 | website | false |
| `/admin/*` | - | - | - | **true** |
| `/api/*` | - | - | - | **true** |

**`/p/[id]` の特記事項：**
- `<h1>` はログライン本文をそのまま使用（現状維持でOK）
- `og:image` は動的OGP生成 or カテゴリ別デフォルト画像を検討
- JSON-LD に `Article` 型を付与

---

### Phase 2: 構造化データ導入（AIO対応・中優先）

#### 2.6 JSON-LD スキーマ設定

**トップページ（WebSite）:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Paperlevels",
  "url": "https://ja.paperlevels.workers.dev",
  "description": "1文から始まる物語。ログラインを投稿して、読者の反応を測ろう。",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ja.paperlevels.workers.dev/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**詳細ページ（Article）:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{ログライン本文（最大110文字に切詰）}",
  "description": "{カテゴリ名}のログライン。{コメント数}件のコメント。",
  "url": "https://ja.paperlevels.workers.dev/p/{id}",
  "datePublished": "{created_at}",
  "dateModified": "{updated_at}",
  "author": {
    "@type": "Organization",
    "name": "Paperlevels"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Paperlevels",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ja.paperlevels.workers.dev/logo.png"
    }
  },
  "interactionStatistic": [
    {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "ShareAction" },
      "userInteractionCount": {シェア数}
    },
    {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "CommentAction" },
      "userInteractionCount": {コメント数}
    }
  ]
}
```

**BreadcrumbList（全ページ）:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://ja.paperlevels.workers.dev"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{ログライン本文（短縮）}",
      "item": "https://ja.paperlevels.workers.dev/p/{id}"
    }
  ]
}
```

#### 2.7 FAQPage スキーマの検討（About ページ）
About ページに FAQ を設置し、`FAQPage` 型の JSON-LD を付与すると、Google の「よくある質問」リッチスニペットに表示される可能性がある。

---

### Phase 3: AIO（AI検索最適化）施策（新規・中優先）

#### 3.1 AI検索対応のメタ最適化

| 施策 | 内容 | 理由 |
|------|------|------|
| **明確な問いかけ形式のH2** | Aboutページに「Paperlevelsとは？」「ログラインとは？」などの見出しを設置 | ChatGPT/Perplexityが引用しやすい構造になる |
| **定義文の明確化** | 各ページの先頭に「Paperlevelsは、1文から始まる物語の実験場です」のような定義文を配置 | AIの「〜とは？」への回答精度向上 |
| **エンティティの明示** | ログラインに「映画」「小説」「ゲーム」などのメディアタイプタグを追加検討 | 知識グラフでのエンティティ紐付け強化 |

#### 3.2 AI Overview / Featured Snippet 対策

```
【トップページの導入文例】
<h1>Paperlevels - ログラインで需要を測る</h1>
<p>Paperlevels（ペーパーレベルズ）は、1文から始まる物語の実験場です。
映画や小説、アニメの「ログライン」（あらすじの要約）を投稿し、
読者の反応（シェア数・コメント）でその需要を測ることができます。</p>

<h2>ログラインとは？</h2>
<p>ログライン（Logline）は、映画や小説のプロットを1〜2文で表現した
「物語の要約文」のことです。例：「タイタニック」→
「身分違いの男女が豪華客船で運命的に出会い、沈没という悲劇の中で
永遠の愛を貫く」。</p>

<h2>Paperlevelsの使い方</h2>
<ol>
  <li>140字以内のログラインを投稿する</li>
  <li>シェアボタンでSNSに拡散して反応を集める</li>
  <li>コメントでフィードバックを受け取る</li>
</ol>
```

#### 3.3 E-E-A-T 強化

| 項目 | 施策 |
|------|------|
| **Experience** | 実際のログライン例を掲載（名作映画のログライン解説ページを追加検討） |
| **Expertise** | 「良いログラインの書き方」ガイドページの追加 |
| **Authoritativeness** | Aboutページに運営者情報・コンタクトを明記 |
| **Trustworthiness** | プライバシーポリシー・利用規約ページの追加、SSL（既存）の確認 |

---

### Phase 4: パフォーマンス・UX改善（継続的）

#### 4.1 Core Web Vitals 対策

| 指標 | 現状の懸念 | 対策 |
|------|-----------|------|
| **LCP** | SSRでレイアウトシフトのリスク | 画像に `width`/`height` 指定、フォントの `font-display: swap` |
| **INP** | コメント投稿時のJS負荷 | インタラクションの非同期処理最適化 |
| **CLS** | OGPプレビューの遅延読み込み | アスペクト比の予約領域確保 |

#### 4.2 静的ページのプリレンダリング検討
```js
// /about など更新頻度の低いページは prerender = true に変更検討
export const prerender = true;
```

#### 4.3 動的OGP画像生成（将来的検討）
Cloudflare Workers 上で `@vercel/og` 相当の機能を実装し、
`/p/[id]` ごとにログライン本文を画像化した OGP を動的生成する。

---

## 3. 実装優先順位

```
Week 1: Phase 1
  1. astro.config に site 設定追加
  2. SEO.astro コンポーネント作成
  3. 全ページに SEO コンポーネント適用
  4. robots.txt 作成
  5. sitemap.xml.ts 作成

Week 2: Phase 2
  6. JSON-LD（Article / WebSite / BreadcrumbList）導入
  7. 各ページの title/description 精緻化

Week 3: Phase 3
  8. About ページのFAQ構造化
  9. E-E-A-T強化（ガイドページ・運営者情報追加）

Week 4: Phase 4
  10. Core Web Vitals計測・改善
  11. 動的OGP画像生成の技術検証
```

---

## 4. 効果測定指標（KPI）

| 指標 | 測定方法 | 目標値 |
|------|----------|--------|
| Google検索での表示回数 | Google Search Console | 施策3ヶ月後に2倍 |
| 検索からのクリック数 | Google Search Console | 施策3ヶ月後に2倍 |
| SNSシェア時のCTR | Twitter/X Analytics | OGP実装後に1.5倍 |
| Core Web Vitals | PageSpeed Insights | 全指標 "Good" |
| AI検索での言及回数 | Perplexity/ChatGPT検索 | ブランド名+「ログライン」で回答に含まれる |

---

## 5. 補足: 実装時の注意点

1. **`.env.local` の管理**: `site` URL は本番・開発で切り替える場合、環境変数で管理する
2. **OGP画像サイズ**: `summary_large_image` は 1200×630px が推奨
3. **JSON-LD文字数**: `headline` は110文字以内（Google推奨）
4. **sitemapの制限**: 50,000 URL / 50MB を超える場合は分割が必要
5. **管理者画面のnoindex**: `/admin/*` は必ず `noindex` を設定し、ログイン画面も同様に保護
