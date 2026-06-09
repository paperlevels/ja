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
    const { id, loglineId } = body;

    const supabase = createAdminClient();
    const { error } = await supabase.schema("public").from("comments").delete().eq("id", id);

    if (error) {
      console.error("Error deleting comment:", error);
      return new Response(
        JSON.stringify({ error: "削除に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: current } = await supabase
      .schema("public")
      .from("loglines")
      .select("comment_count")
      .eq("id", loglineId)
      .single();

    if (current && current.comment_count > 0) {
      await supabase
        .schema("public")
        .from("loglines")
        .update({ comment_count: current.comment_count - 1 })
        .eq("id", loglineId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "削除に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
