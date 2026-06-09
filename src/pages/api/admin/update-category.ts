import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const authClient = createClient(request, {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
      delete: (name, options) => cookies.delete(name, options),
    });

    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { id, category } = body;

    const supabase = createAdminClient();
    const { error } = await supabase
      .schema("public")
      .from("loglines")
      .update({ category: category?.trim() || null })
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return new Response(
        JSON.stringify({ error: "更新に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "更新に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
