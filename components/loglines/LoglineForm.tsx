"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createLogline } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function LoglineForm() {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await createLogline(formData);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("投稿しました！");
    setContent("");
    if (result.id) {
      router.push("/");
    }
  }

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
        <span
          className={`text-xs font-medium transition-colors ${
            content.length >= 140
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {content.length} / 140
        </span>
        <Button
          type="submit"
          disabled={pending || content.length === 0}
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
