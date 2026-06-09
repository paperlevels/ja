"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

interface OgpData {
  title?: string;
  description?: string;
  image?: {
    url?: string;
  };
}

interface OgpPreviewProps {
  url: string;
}

export function OgpPreview({ url }: OgpPreviewProps) {
  const [ogp, setOgp] = useState<OgpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchOgp() {
      try {
        const res = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) throw new Error("Failed to fetch OGP");
        const data = await res.json();
        if (!cancelled && data.data) {
          setOgp(data.data);
        }
      } catch {
        // fallback to plain link
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOgp();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 rounded-lg border border-border/40 bg-muted/30 p-3 animate-pulse">
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="h-3 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!ogp || (!ogp.title && !ogp.description && !ogp.image?.url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all transition-colors"
      >
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block rounded-lg border border-border/40 bg-card overflow-hidden hover:shadow-sm transition-all duration-300 hover:border-border"
    >
      {ogp.image?.url && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogp.image.url}
            alt={ogp.title || ""}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        {ogp.title && (
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {ogp.title}
          </p>
        )}
        {ogp.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {ogp.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1.5 truncate">{url}</p>
      </div>
    </a>
  );
}
