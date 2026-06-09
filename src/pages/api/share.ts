import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonResponse } from "@/lib/api-response";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return jsonResponse({ error: "IDが必要です" }, { status: 400 });
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
      return jsonResponse({ error: "カウントに失敗しました" }, { status: 500 });
    }

    const { error } = await supabase
      .schema("public")
      .from("loglines")
      .update({ share_count: current.share_count + 1 })
      .eq("id", id);

    if (error) {
      console.error("Error incrementing share count:", error);
      return jsonResponse({ error: "カウントに失敗しました" }, { status: 500 });
    }

    return jsonResponse({ success: true });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "カウントに失敗しました" }, { status: 500 });
  }
};
