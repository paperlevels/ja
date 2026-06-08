import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Share2, ArrowUpRight } from "lucide-react";
import { Logline } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface LoglineCardProps {
  logline: Logline;
}

export function LoglineCard({ logline }: LoglineCardProps) {
  const timeAgo = formatDistanceToNow(new Date(logline.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Link href={`/p/${logline.id}`} className="group block">
      <article className="relative rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 hover:border-border">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[15px] font-medium leading-relaxed text-foreground group-hover:text-primary transition-colors">
            {logline.content}
          </p>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div className="mt-4 flex items-center justify-between">
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
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <Share2 className="h-3.5 w-3.5" />
              <span>{logline.share_count}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{logline.comment_count}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
