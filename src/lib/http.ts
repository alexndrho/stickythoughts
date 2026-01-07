import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  const ip =
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";

  return ip.replace(/^::ffff:/, "");
}
