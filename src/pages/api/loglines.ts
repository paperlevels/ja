import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";

const FORBIDDEN_CHARS = /[\/\\?&\#%\n\r\t]/;

function validateContent(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length === 0 || trimmed.length > 140) {
    return "ログラインは1〜140文字で入力してください";
  }
  if (FORBIDDEN_CHARS.test(trimmed)) {
    return "URLに使用される文字（/ ? & # % \\ など）は使用できません";
  }
  return null;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;

    const validationError = validateContent(content);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const trimmed = content.trim();
    const supabase = createClient(request, {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
      delete: (name, options) => cookies.delete(name, options),
    });

    // duplicate check
    const { data: existing } = await supabase
      .schema("public")
      .from("loglines")
      .select("id")
      .eq("content", trimmed)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "同じ内容は既に投稿されています" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .schema("public")
      .from("loglines")
      .insert({ id: trimmed, content: trimmed })
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
      JSON.stringify({ success: true, logline: data }),
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
