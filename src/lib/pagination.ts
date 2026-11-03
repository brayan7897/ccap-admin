/** A page of server-side results plus the total matching the active filters. */
export interface Page<T> {
  items: T[];
  total: number;
}

/**
 * Reads the `X-Total-Count` header the admin list endpoints send.
 * Falls back to a lower bound (rows seen so far) if the header is missing,
 * so pagination degrades gracefully instead of breaking.
 */
export function readTotal(
  headers: unknown,
  skip: number,
  itemCount: number,
): number {
  const h = headers as
    | { get?: (k: string) => unknown; [k: string]: unknown }
    | undefined;
  const raw =
    (typeof h?.get === "function" ? h.get("x-total-count") : undefined) ??
    h?.["x-total-count"];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && raw !== undefined && raw !== null && raw !== ""
    ? parsed
    : skip + itemCount;
}
