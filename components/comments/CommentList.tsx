"use client";

import { Comment } from "@/types/database";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { OgpPreview } from "./OgpPreview";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

interface CommentListProps {
  comments: Comment[];
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s\)\]\>]+/g;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
        <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          まだコメントがありません
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          最初のコメントを投稿してみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => {
        const urls = extractUrls(comment.content);
        return (
          <div
            key={comment.id}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
            <MarkdownRenderer content={comment.content} />
            {urls.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {urls.map((url) => (
                  <OgpPreview key={url} url={url} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
