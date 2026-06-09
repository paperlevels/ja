"use client";

import { useEffect, useState } from "react";
import type { Logline, Comment } from "@/types/database";
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
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

interface AdminDashboardProps {
  loglines: Logline[];
  comments: Comment[];
}

export default function AdminDashboard({ loglines: initialLoglines, comments: initialComments }: AdminDashboardProps) {
  const [loglines, setLoglines] = useState(initialLoglines);
  const [comments, setComments] = useState(initialComments);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function handleDeleteLogline(id: string) {
    const res = await fetch("/api/admin/delete-logline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLoglines((prev) => prev.filter((l) => l.id !== id));
    toast.success("削除しました");
  }

  async function handleDeleteComment(id: string, loglineId: string) {
    const res = await fetch("/api/admin/delete-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, loglineId }),
    });
    const result = await res.json();
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
    setLoglines((prev) =>
      prev.map((l) =>
        l.id === loglineId ? { ...l, comment_count: Math.max(0, l.comment_count - 1) } : l
      )
    );
    toast.success("削除しました");
  }

  async function handleUpdateCategory(id: string, category: string) {
    const res = await fetch("/api/admin/update-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category }),
    });
    const result = await res.json();
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLoglines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, category: category.trim() || null } : l))
    );
    toast.success("更新しました");
  }

  return (
    <div data-hydrated={hydrated ? "true" : "false"} className="flex flex-col gap-10">
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
                        href={`/p/${encodeURIComponent(logline.id)}`}
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
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const category = formData.get("category") as string;
                            await handleUpdateCategory(logline.id, category);
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
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-lg"
                          onClick={() => handleDeleteLogline(logline.id)}
                        >
                          削除
                        </Button>
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
                        href={`/p/${encodeURIComponent(comment.logline_id)}`}
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
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => handleDeleteComment(comment.id, comment.logline_id)}
                      >
                        削除
                      </Button>
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
