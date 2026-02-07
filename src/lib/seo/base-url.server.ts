const FALLBACK_BASE_URL = "http://localhost:3000";

function pickRawBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    FALLBACK_BASE_URL
  );
}

export function getBaseUrl(): URL {
  const raw = pickRawBaseUrl();
  try {
    return new URL(raw);
  } catch {
    // Avoid throwing in metadata/robots/sitemap routes due to a malformed env var.
    return new URL(FALLBACK_BASE_URL);
  }
}

