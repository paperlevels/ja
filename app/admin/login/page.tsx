"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("ログインに失敗しました");
      return;
    }

    toast.success("ログインしました");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
          <Lock className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          管理者ログイン
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          管理画面にアクセスするには認証が必要です
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg"
            placeholder="admin@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            パスワード
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg"
            placeholder="••••••••"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </div>
  );
}
