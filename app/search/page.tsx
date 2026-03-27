export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { getDisplayReadTime } from "../lib/read-time";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Search",
  description: "Search the published archive of Surface Interval.",
  openGraph: {
    title: "Search · Surface Interval",
    description: "Search the published archive of Surface Interval.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search · Surface Interval",
    description: "Search the published archive of Surface Interval.",
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  let posts:
    | Array<{
        id: number;
        slug: string;
        title: string;
        category: string;
        excerpt: string;
        hero_image?: string | null;
        read_time?: string | null;
        published_at?: string | null;
        tags?: string[] | null;
        body?: unknown;
      }>
    | null = null;

  if (query) {
    const { data: matchedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .or(
        `title.ilike.%${query}%,excerpt.ilike.%${query}%,category.ilike.%${query}%`
      )
      .order("published_at", { ascending: false });

    const basePosts = matchedPosts ?? [];

    const { data: tagMatchedPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .contains("tags", [query])
      .order("published_at", { ascending: false });

    const combined = [...basePosts, ...(tagMatchedPosts ?? [])];

    const dedupedMap = new Map<number, (typeof combined)[number]>();
    combined.forEach((post) => {
      dedupedMap.set(post.id, post);
    });

    posts = Array.from(dedupedMap.values())
      .map((post) => ({
        ...post,
        read_time: getDisplayReadTime(post.read_time, post.body),
      }))
      .sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bDate - aDate;
      });
  }

  return (
    <>
      <Header />

      <section className="archive-shell">
        <div className="archive-head">
          <div className="archive-label">Search</div>
          <h1 className="archive-title">Find a dispatch</h1>
        </div>

        <form method="GET" action="/search" className="search-form">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title, excerpt, category, or exact tag"
            className="search-input"
          />
          <button type="submit">Search</button>
        </form>

        {query ? (
          <div className="search-meta">
            {posts && posts.length > 0
              ? `${posts.length} result${posts.length > 1 ? "s" : ""} for "${query}"`
              : `No results for "${query}"`}
          </div>
        ) : (
          <div className="search-meta">
            Search the published archive by title, excerpt, category, or exact tag.
          </div>
        )}

        {query && posts && posts.length > 0 ? (
          <div className="posts">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                {post.hero_image ? (
                  <img src={post.hero_image} alt={post.title} />
                ) : (
                  <div className="post-card-placeholder" />
                )}

                <div className="post-meta">
                  <div className="post-category">{post.category}</div>

                  <h2 className="post-title">
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <div className="post-desc">{post.excerpt}</div>

                  <div className="story-meta" style={{ marginTop: 14 }}>
                    By Irene W · {post.read_time} ·{" "}
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </div>

                  {post.tags?.length ? (
                    <div className="post-tags" style={{ marginTop: 16 }}>
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="tag"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <Footer settings={settings} />
    </>
  );
}