"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";

const FORBIDDEN_CHARS = /[\/\\?&\#%\n\r\t]/;

function getValidationError(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length === 0 || trimmed.length > 140) {
    return "ログラインは1〜140文字で入力してください";
  }
  if (FORBIDDEN_CHARS.test(trimmed)) {
    return "URLに使用される文字（/ ? & # % \\ など）は使用できません";
  }
  return null;
}

export function LoglineForm() {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);

    try {
      const response = await fetch("/api/loglines", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("投稿しました！");
      setContent("");
      window.location.href = "/p/" + encodeURIComponent(result.id);
    } catch {
      toast.error("投稿に失敗しました");
    } finally {
      setPending(false);
    }
  }

  const validationError = getValidationError(content);

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <Textarea
        name="content"
        placeholder="サイトの目的を1行で表現..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={140}
        required
        className="resize-none border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
      />
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-xs font-medium transition-colors ${
              content.length >= 140
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {content.length} / 140
          </span>
          {content.length > 0 && validationError && (
            <span className="text-[11px] text-destructive">{validationError}</span>
          )}
        </div>
        <Button
          type="submit"
          disabled={pending || content.length === 0 || !!validationError}
          size="sm"
          className="gap-1.5 rounded-lg px-4"
        >
          <Send className="h-3.5 w-3.5" />
          {pending ? "投稿中..." : "投稿する"}
        </Button>
      </div>
    </form>
  );
}
