import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { loglineId, content } = body;

    if (!loglineId) {
      return new Response(
        JSON.stringify({ error: "ログラインIDが必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!content || content.trim().length === 0 || content.trim().length > 5000) {
      return new Response(
        JSON.stringify({ error: "コメントは1〜5000文字で入力してください" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(request, {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
      delete: (name, options) => cookies.delete(name, options),
    });

    const { data: comment, error } = await supabase
      .schema("public")
      .from("comments")
      .insert({
        logline_id: loglineId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return new Response(
        JSON.stringify({ error: "コメント投稿に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: current } = await supabase
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    if (current) {
      await supabase
        .schema("public")
        .from("loglines")
        .update({ comment_count: current.comment_count + 1 })
        .eq("id", loglineId);
    }

    return new Response(
      JSON.stringify({ success: true, comment }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "コメント投稿に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
