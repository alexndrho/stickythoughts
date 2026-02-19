import type { SerializeDates } from "@/types/serialization";

/**
 * Type-only marker for API response boundaries.
 *
 * This helper does not serialize values at runtime. In Next.js route handlers,
 * `NextResponse.json(...)` performs JSON serialization (including `Date -> string`).
 * We use this cast immediately before returning JSON so TypeScript can model the
 * response as `SerializeDates<T>` without duplicating runtime serialization logic.
 */
export function toDTO<T>(value: T): SerializeDates<T> {
  return value as SerializeDates<T>;
}
