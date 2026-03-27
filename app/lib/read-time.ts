export function getReadTimeFromBody(body: unknown): string {
  if (!Array.isArray(body)) return "1 min read";

  const text = body
    .filter((item): item is string => typeof item === "string")
    .join(" ")
    .trim();

  if (!text) return "1 min read";

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return `${minutes} min read`;
}

export function getDisplayReadTime(
  readTime: string | null | undefined,
  body: unknown
): string {
  const trimmed = typeof readTime === "string" ? readTime.trim() : "";
  if (trimmed) return trimmed;
  return getReadTimeFromBody(body);
}