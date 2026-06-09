import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "astro:env/client";
import { SUPABASE_SERVICE_ROLE_KEY } from "astro:env/server";

export function createAdminClient() {
  return createSupabaseClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createAnonClient() {
  return createSupabaseClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getAuthCookies(
  email: string,
  password: string
): Promise<Record<string, string>> {
  const cookieStore = new Map<string, string>();

  const client = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return Array.from(cookieStore.entries()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        cookies.forEach(({ name, value }) => {
          cookieStore.set(name, value);
        });
      },
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  return Object.fromEntries(cookieStore.entries());
}

export async function createTestUser(email: string, password: string) {
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    await admin.auth.admin.deleteUser(existing.id);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  if (!data.user) throw new Error("Failed to create test user");
  return data.user;
}

export async function deleteTestUser(userId: string) {
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
}

export async function invokeAPIRoute(
  handler: APIRoute,
  options: {
    method?: string;
    body?: BodyInit | null;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
) {
  const { method = "GET", body = null, headers = {}, cookies = {} } = options;
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  const request = new Request("http://localhost/api/test", {
    method,
    body,
    headers: {
      cookie: cookieHeader,
      ...headers,
    },
  });

  const cookieMap = new Map(Object.entries(cookies));

  const mockCookies = {
    get: (name: string) => {
      const value = cookieMap.get(name);
      if (!value) return undefined;
      return {
        value,
        json: () => JSON.parse(value),
        number: () => Number(value),
      };
    },
    set: (name: string, value: string) => {
      cookieMap.set(name, value);
    },
    delete: (name: string) => {
      cookieMap.delete(name);
    },
    has: (name: string) => cookieMap.has(name),
    entries: () => cookieMap.entries(),
  };

  const context = {
    request,
    cookies: mockCookies as any,
    url: new URL("http://localhost/api/test"),
    site: new URL("http://localhost"),
    params: {},
    props: {},
    redirect: (path: string) =>
      new Response(null, { status: 302, headers: { location: path } }),
    getClientAddress: () => "127.0.0.1",
    generator: "Astro",
    locals: {},
    currentLocale: undefined,
  } as any;

  return handler(context);
}

export async function cleanupTestLogline(id: string) {
  const admin = createAdminClient();
  await admin.schema("public").from("comments").delete().eq("logline_id", id);
  await admin.schema("public").from("loglines").delete().eq("id", id);
}

export async function cleanupTestComment(id: string) {
  const admin = createAdminClient();
  await admin.schema("public").from("comments").delete().eq("id", id);
}

export function uniqueTestContent(base: string): string {
  return `__test_${Date.now()}_${base}`;
}
