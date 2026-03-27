import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  hero_image?: string | null;
  read_time?: string | null;
  published_at?: string | null;
};

type Settings = {
  quote_text?: string | null;
  quote_author?: string | null;
};

export default function EditorialHome({
  posts,
  settings,
  editorsPicks,
  featuredPost,
}: {
  posts: Post[];
  settings: Settings | null;
  editorsPicks: Post[];
  featuredPost: Post | null;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-title">Latest Dispatches</div>

        {featuredPost ? (
          <Link
            className="section-link"
            href={`/posts/${featuredPost.slug}`}
          >
            Read featured story
          </Link>
        ) : (
          <span className="section-link">Latest stories</span>
        )}
      </div>

      <div className="editorial-grid">
        <div className="story-list">
          {posts.map((post) => (
            <article key={post.slug} className="story-row">
              <div>
                <div className="story-kicker">{post.category}</div>

                <h2 className="story-title">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h2>

                <div className="story-body">{post.excerpt}</div>

                <div className="story-meta">
                  By Irene W · {post.read_time ?? "8 min read"} ·{" "}
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Mar 2026"}
                </div>
              </div>

              {post.hero_image ? (
                <div
                  className="story-thumb"
                  style={{
                    background: `url('${post.hero_image}') center/cover`,
                  }}
                />
              ) : (
                <div className="story-thumb" />
              )}
            </article>
          ))}
        </div>

        <aside className="side-rail">
          <div className="rail-card">
            <div className="rail-title">Editor&apos;s Picks</div>

            {editorsPicks.length > 0 ? (
              editorsPicks.map((post) => (
                <div key={post.slug} className="rail-item">
                  <div className="rail-kicker">{post.category}</div>

                  <div className="rail-item-title">
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </div>

                  <div className="rail-meta">
                    {post.read_time ?? "8 min"} ·{" "}
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="rail-item">
                <div className="rail-item-title">No editor&apos;s picks yet</div>
                <div className="rail-meta">
                  Mark posts in the dashboard to feature them here.
                </div>
              </div>
            )}
          </div>

          <div className="rail-card quote-box">
            <div className="rail-title">About this journal</div>
            <div className="quote">
              {settings?.quote_text ||
                "Surface Interval is the pause between dives. It is where the stories settle."}
            </div>
            <div className="quote-name">
              — {settings?.quote_author || "Irene W"}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}