import "server-only";

import type { NextRequest } from "next/server";

function isEnvTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function normalizeIp(ip: string): string {
  return ip.trim().replace(/^::ffff:/, "");
}

function firstForwardedForValue(value: string): string {
  // x-forwarded-for and friends can contain a chain: "client, proxy1, proxy2"
  return value.split(",")[0]?.trim() ?? "";
}

function isTrustedProxyEnvironment(): boolean {
  return (
    process.env.VERCEL === "1" ||
    isEnvTruthy(process.env.TRUST_PROXY) ||
    process.env.NODE_ENV !== "production"
  );
}

export function getClientIp(
  request: Pick<NextRequest, "headers"> & { ip?: string | null },
): string {
  if (!isTrustedProxyEnvironment()) {
    // In an untrusted environment we intentionally do not honor spoofable headers.
    if (request.ip) return normalizeIp(request.ip);
    return "unknown";
  }

  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    const ip = firstForwardedForValue(vercelForwardedFor);
    return ip ? normalizeIp(ip) : "unknown";
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return normalizeIp(cfConnectingIp);

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = firstForwardedForValue(forwardedFor);
    return ip ? normalizeIp(ip) : "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp);

  if (request.ip) return normalizeIp(request.ip);
  return "unknown";
}
