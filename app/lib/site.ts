export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://surfaceinterval.vercel.app"
  ).replace(/\/$/, "");
}