"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import type { Comment } from "@/types/database";

interface CommentFormProps {
  loglineId: string;
  onSuccess?: (comment: Comment) => void;
}

export function CommentForm({ loglineId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setPending(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loglineId, content }),
      });
      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("コメントを投稿しました");
      setContent("");
      if (result.comment && onSuccess) {
        onSuccess(result.comment);
      }
    } catch {
      toast.error("コメント投稿に失敗しました");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <Textarea
        name="content"
        placeholder="コメントを入力（Markdown対応）"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={10000}
        required
        className="resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
      />
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <span
          className={`text-xs font-medium transition-colors ${
            content.length >= 10000
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {content.length} / 10000
        </span>
        <Button
          type="submit"
          disabled={pending || content.length === 0}
          size="sm"
          className="gap-1.5 rounded-lg px-4"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {pending ? "投稿中..." : "コメントする"}
        </Button>
      </div>
    </form>
  );
}
