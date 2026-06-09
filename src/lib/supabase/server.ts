import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "astro:env/server";

const url = (PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !key) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env.local file."
  );
}

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  const cookies: { name: string; value: string }[] = [];
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const name = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    cookies.push({ name, value });
  }
  return cookies;
}

export interface CookieApi {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptionsWithName) => void;
  delete: (name: string, options: CookieOptionsWithName) => void;
}

export function createClient(request: Request, cookieApi: CookieApi) {
  const cookieHeader = request.headers.get("cookie") || "";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (value === "" || options.maxAge === 0) {
            cookieApi.delete(name, options);
          } else {
            cookieApi.set(name, value, options);
          }
        });
      },
    },
  });
}
