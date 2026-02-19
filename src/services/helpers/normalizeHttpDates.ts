import type { DeserializeDates } from "@/types/serialization";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value) || value instanceof Date) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

const DATE_FIELD_KEYS = new Set<string>([
  "createdAt",
  "updatedAt",
  "accessTokenExpiresAt",
  "refreshTokenExpiresAt",
  "banExpires",
  "expiresAt",
  "deletedAt",
  "highlightedAt",
]);

function shouldConvertDateKey(key: string): boolean {
  return DATE_FIELD_KEYS.has(key);
}

function normalizeValue(value: unknown, key?: string): unknown {
  if (value instanceof Date) return value;

  if (key && shouldConvertDateKey(key) && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const normalized: Record<string, unknown> = {};
  for (const [entryKey, entryValue] of Object.entries(value)) {
    normalized[entryKey] = normalizeValue(entryValue, entryKey);
  }

  return normalized;
}

export function parseDtoDates<T>(input: T): DeserializeDates<T> {
  return normalizeValue(input) as DeserializeDates<T>;
}
