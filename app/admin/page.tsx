import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logline, Comment } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deleteLogline,
  deleteComment,
  updateLoglineCategory,
} from "@/lib/actions";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export const dynamic = "force-dynamic";

async function getAdminData() {
  const adminClient = createAdminClient();

  const { data: loglines, error: loglinesError } = await adminClient
    .from("loglines")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: comments, error: commentsError } = await adminClient
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (loglinesError) console.error("Error fetching loglines:", loglinesError);
  if (commentsError) console.error("Error fetching comments:", commentsError);

  return {
    loglines: (loglines || []) as Logline[],
    comments: (comments || []) as Comment[],
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { loglines, comments } = await getAdminData();

  return (
    <div className="flex flex-col gap-10">
      {/* Loglines */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          ログライン一覧
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {loglines.length}
          </span>
        </h2>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-1/3 text-xs font-medium text-muted-foreground">本文</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">カテゴリ</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">シェア</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">コメント</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">投稿日時</TableHead>
                  <TableHead className="w-[200px] text-xs font-medium text-muted-foreground">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loglines.map((logline) => (
                  <TableRow key={logline.id} className="border-border/40">
                    <TableCell className="font-medium text-sm">
                      <a
                        href={`/p/${logline.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors hover:underline"
                      >
                        {logline.content}
                      </a>
                    </TableCell>
                    <TableCell>
                      {logline.category ? (
                        <Badge variant="secondary" className="rounded-md text-[11px]">
                          {logline.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{logline.share_count}</TableCell>
                    <TableCell className="text-sm">{logline.comment_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(logline.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            const category = formData.get("category") as string;
                            await updateLoglineCategory(logline.id, category);
                          }}
                          className="flex gap-2"
                        >
                          <Input
                            name="category"
                            defaultValue={logline.category || ""}
                            placeholder="カテゴリ"
                            className="h-8 text-sm rounded-lg"
                          />
                          <Button type="submit" size="sm" variant="outline" className="rounded-lg">
                            更新
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteLogline(logline.id);
                          }}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                          >
                            削除
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          コメント一覧
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {comments.length}
          </span>
        </h2>
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-1/3 text-xs font-medium text-muted-foreground">内容</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">ログライン</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">投稿日時</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id} className="border-border/40">
                    <TableCell className="font-medium text-sm max-w-xs truncate">
                      {comment.content}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/p/${comment.logline_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors hover:underline text-sm"
                      >
                        リンク
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>
                      <form
                        action={async () => {
                          "use server";
                          await deleteComment(comment.id, comment.logline_id);
                        }}
                      >
                        <Button type="submit" size="sm" variant="destructive" className="rounded-lg">
                          削除
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}
