const JSON_HEADERS = {
  "Content-Type": "application/json",
  "X-Robots-Tag": "noindex, nofollow",
};

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(JSON_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}
