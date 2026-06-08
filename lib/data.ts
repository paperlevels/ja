import { createClient } from "@/lib/supabase/server";
import { Logline, Comment } from "@/types/database";

export async function getLoglines(
  sort: "popular" | "newest" = "popular",
  search?: string
): Promise<Logline[]> {
  const supabase = await createClient();

  let query = supabase.schema("public").from("loglines").select("*");

  if (search && search.trim().length > 0) {
    query = query.ilike("content", `%${search.trim()}%`);
  }

  if (sort === "popular") {
    query = query.order("share_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching loglines:", error);
    console.error(
      "Hint: If you see PGRST125, make sure you have run 'supabase/schema.sql' in the Supabase SQL Editor."
    );
    return [];
  }

  return data || [];
}

export async function getLoglineById(id: string): Promise<Logline | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("public")
    .from("loglines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching logline:", error);
    return null;
  }

  return data;
}

export async function getComments(loglineId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("public")
    .from("comments")
    .select("*")
    .eq("logline_id", loglineId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
}

export async function incrementShareCount(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: current, error: fetchError } = await supabase
    .schema("public")
    .from("loglines")
    .select("share_count")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    console.error("Error fetching share count:", fetchError);
    return;
  }

  const { error } = await supabase
    .schema("public")
    .from("loglines")
    .update({ share_count: current.share_count + 1 })
    .eq("id", id);

  if (error) {
    console.error("Error incrementing share count:", error);
  }
}
