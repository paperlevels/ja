import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "IDが必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    const { data: current, error: fetchError } = await supabase
      .schema("public")
      .from("loglines")
      .select("share_count")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      console.error("Error fetching share count:", fetchError);
      return new Response(
        JSON.stringify({ error: "カウントに失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .schema("public")
      .from("loglines")
      .update({ share_count: current.share_count + 1 })
      .eq("id", id);

    if (error) {
      console.error("Error incrementing share count:", error);
      return new Response(
        JSON.stringify({ error: "カウントに失敗しました" }),
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
      JSON.stringify({ error: "カウントに失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
