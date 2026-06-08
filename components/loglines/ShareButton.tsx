"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { incrementShareCount } from "@/lib/actions";
import { toast } from "sonner";

interface ShareButtonProps {
  id: string;
  content: string;
  initialCount: number;
}

export function ShareButton({ id, content, initialCount }: ShareButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [lastClicked, setLastClicked] = useState<number>(0);

  const handleShare = useCallback(async () => {
    const now = Date.now();
    if (now - lastClicked < 60000) {
      toast.info("1分間はカウントされません");
      return;
    }
    setLastClicked(now);

    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${id}`;
    const text = `「${content}」 — このアイデア、需要ある？ #Paperlevels`;
    const shareData = { title: "Paperlevels", text, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    }

    const result = await incrementShareCount(id);
    if (!result.error) {
      setCount((c) => c + 1);
    }
  }, [id, content, lastClicked]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-1.5 rounded-lg border-border/60 text-xs font-medium"
    >
      <Share2 className="h-3.5 w-3.5" />
      シェア
      <span className="ml-0.5 text-muted-foreground">{count}</span>
    </Button>
  );
}
