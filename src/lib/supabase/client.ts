import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "astro:env/client";

export function createClient() {
  const url = (PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = PUBLIC_SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Check your .env.local file."
    );
  }

  return createBrowserClient(url, key);
}
