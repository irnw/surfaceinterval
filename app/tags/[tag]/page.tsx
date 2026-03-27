export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createSupabaseServerClient } from "../../lib/supabase-server";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag}`,
    description: `Posts tagged #${decodedTag} on Surface Interval.`,
    openGraph: {
      title: `#${decodedTag} · Surface Interval`,
      description: `Posts tagged #${decodedTag} on Surface Interval.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `#${decodedTag} · Surface Interval`,
      description: `Posts tagged #${decodedTag} on Surface Interval.`,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .contains("tags", [decodedTag])
    .order("published_at", { ascending: false });

  if (!posts || posts.length === 0) return notFound();

  return (
    <>
      <Header />

      <section className="archive-shell">
        <div className="archive-head">
          <div className="archive-label">Tag</div>
          <h1 className="archive-title">#{decodedTag}</h1>
        </div>

        <div className="search-meta" style={{ marginTop: -10 }}>
          A running thread of dispatches connected by one recurring idea.
        </div>

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

                {post.tags?.length > 0 ? (
                  <div className="post-tags" style={{ marginTop: 16 }}>
                    {post.tags.map((item: string) => (
                      <Link
                        key={item}
                        href={`/tags/${encodeURIComponent(item)}`}
                        className="tag"
                      >
                        #{item}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer settings={settings} />
    </>
  );
}