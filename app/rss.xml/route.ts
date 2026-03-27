import { createSupabaseServerClient } from "../lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  const base = "https://surfaceinterval.blog";

  const items =
    posts?.map(
      (post) => `
    <item>
      <title>${post.title}</title>
      <link>${base}/posts/${post.slug}</link>
      <description>${post.excerpt}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>
  `
    ) || [];

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>Surface Interval</title>
<link>${base}</link>
<description>A journal from the deep end of the world.</description>
${items.join("")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}