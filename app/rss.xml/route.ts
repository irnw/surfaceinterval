import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post) => {
      const url = `${baseUrl}/posts/${post.slug}`;
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${new Date(post.published_at || new Date()).toUTCString()}</pubDate>
          <description><![CDATA[${post.excerpt || ""}]]></description>
        </item>
      `;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Surface Interval</title>
      <link>${baseUrl}</link>
      <description>Dive logs, travel, gear, and the quieter moments in between.</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}