import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "astro:env/server";
import type { Logline, Comment } from "@/types/database";

const url = (PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = PUBLIC_SUPABASE_ANON_KEY || "";

function getPublicClient() {
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }
  return createAdminClient(url, key);
}

export async function getLoglines(
  sort: "popular" | "newest" = "popular",
  search?: string
): Promise<Logline[]> {
  const supabase = getPublicClient();

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
    return [];
  }

  return (data || []) as Logline[];
}

export async function getLoglineById(id: string): Promise<Logline | null> {
  const supabase = getPublicClient();
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

  return data as Logline | null;
}

export async function getComments(loglineId: string): Promise<Comment[]> {
  const supabase = getPublicClient();
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

  return (data || []) as Comment[];
}
