import { notFound } from "next/navigation";
import { getLoglineById, getComments } from "@/lib/data";
import { ShareButton } from "@/components/loglines/ShareButton";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const logline = await getLoglineById(id);

  if (!logline) {
    notFound();
  }

  const comments = await getComments(id);

  const timeAgo = formatDistanceToNow(new Date(logline.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Back Link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>

      {/* Logline Content */}
      <article className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
        <h1 className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
          {logline.content}
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {logline.category && (
              <Badge
                variant="secondary"
                className="rounded-md px-2 py-0.5 text-[11px] font-medium"
              >
                {logline.category}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{logline.comment_count}</span>
            </div>
          </div>
          <ShareButton
            id={logline.id}
            content={logline.content}
            initialCount={logline.share_count}
          />
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          コメント
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {comments.length}
          </span>
        </h2>
        <div className="mt-6">
          <CommentList comments={comments} />
        </div>
        <div className="mt-4">
          <CommentForm loglineId={logline.id} />
        </div>
      </div>
    </div>
  );
}
