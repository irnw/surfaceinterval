export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createSupabaseServerClient } from "../../lib/supabase-server";
import { getDisplayReadTime } from "../../lib/read-time";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function formatCategoryLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryLabel = formatCategoryLabel(slug);

  return {
    title: categoryLabel,
    description: `${categoryLabel} posts from Surface Interval.`,
    openGraph: {
      title: `${categoryLabel} · Surface Interval`,
      description: `${categoryLabel} posts from Surface Interval.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryLabel} · Surface Interval`,
      description: `${categoryLabel} posts from Surface Interval.`,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const categoryLabel = formatCategoryLabel(slug);

  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .ilike("category", categoryLabel)
    .order("published_at", { ascending: false });

  const posts = (rawPosts ?? []).map((post) => ({
    ...post,
    read_time: getDisplayReadTime(post.read_time, post.body),
  }));

  if (!posts || posts.length === 0) {
    return notFound();
  }

  return (
    <>
      <Header />

      <section className="archive-shell">
        <div className="archive-head">
          <div className="archive-label">Category</div>
          <h1 className="archive-title">{categoryLabel}</h1>
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

                <div className="story-meta" style={{ marginTop: 14 }}>
                  By Irene W · {post.read_time} ·{" "}
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>

                {post.tags?.length > 0 ? (
                  <div className="post-tags" style={{ marginTop: 16 }}>
                    {post.tags.map((tag: string) => (
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
      </section>

      <Footer settings={settings} />
    </>
  );
}