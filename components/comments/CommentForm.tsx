"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/actions";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";

interface CommentFormProps {
  loglineId: string;
}

export function CommentForm({ loglineId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setPending(true);
    const result = await createComment(loglineId, content);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("コメントを投稿しました");
    setContent("");
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
        maxLength={5000}
        required
        className="resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
      />
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <span
          className={`text-xs font-medium transition-colors ${
            content.length >= 5000
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {content.length} / 5000
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
