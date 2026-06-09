import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content || content.trim().length === 0 || content.trim().length > 140) {
      return new Response(
        JSON.stringify({ error: "ログラインは1〜140文字で入力してください" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(request, {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
      delete: (name, options) => cookies.delete(name, options),
    });

    const { data, error } = await supabase
      .schema("public")
      .from("loglines")
      .insert({ content: content.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error creating logline:", error);
      return new Response(
        JSON.stringify({ error: "投稿に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "投稿に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
