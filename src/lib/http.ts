import { type NextRequest } from "next/server";

export function getClientIp(request: NextRequest) {
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  return ip.replace(/^::ffff:/, "");
}
