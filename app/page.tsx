import { Suspense } from "react";
import { LoglineForm } from "@/components/loglines/LoglineForm";
import { LoglineCard } from "@/components/loglines/LoglineCard";
import { getLoglines } from "@/lib/data";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    sort?: string;
    q?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const sort = params.sort === "popular" ? "popular" : "newest";
  const search = params.q || "";

  const loglines = await getLoglines(sort, search);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          あなたが欲しいサイトを
          <br className="hidden sm:block" />
          <span className="text-muted-foreground">1行で投稿</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          アイデアの需要を、最小限で早期に検証
        </p>
      </section>

      {/* Post Form */}
      <section className="mb-10">
        <LoglineForm />
      </section>

      {/* Sort Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-full bg-secondary p-1 w-fit">
        <a
          href={`?${search ? `q=${encodeURIComponent(search)}&` : ""}sort=popular`}
          className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            sort === "popular"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          人気順
        </a>
        <a
          href={`?${search ? `q=${encodeURIComponent(search)}&` : ""}sort=newest`}
          className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            sort === "newest"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          新着順
        </a>
      </div>

      {/* List */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {loglines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                まだ投稿がありません
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                最初のログラインを投稿してみましょう
              </p>
            </div>
          ) : (
            loglines.map((logline) => (
              <LoglineCard key={logline.id} logline={logline} />
            ))
          )}
        </div>
      </Suspense>
    </div>
  );
}
