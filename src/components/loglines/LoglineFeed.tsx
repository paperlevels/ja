"use client";

import { useState, useEffect } from "react";
import { LoglineForm } from "./LoglineForm";
import { LoglineCard } from "./LoglineCard";
import type { Logline } from "@/types/database";
import type { SortOrder } from "@/types/database";

interface LoglineFeedProps {
  initialLoglines: Logline[];
  sort: SortOrder;
  search: string;
}

export function LoglineFeed({ initialLoglines, sort, search }: LoglineFeedProps) {
  const [loglines, setLoglines] = useState<Logline[]>(initialLoglines);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const handleSuccess = (logline: Logline) => {
    setLoglines((prev) => [logline, ...prev]);
    setHighlightId(logline.id);
  };

  return (
    <>
      {/* Post Form */}
      <section className="mb-10">
        <LoglineForm onSuccess={handleSuccess} />
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
            <LoglineCard
              key={logline.id}
              logline={logline}
              highlight={logline.id === highlightId}
            />
          ))
        )}
      </div>
    </>
  );
}
