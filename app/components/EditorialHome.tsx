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

function formatDate(iso?: string | null) {
  if (!iso) return "Mar 2026";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

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
  // Grid posts: exclude featured post from the grid, show up to 4
  const gridPosts = posts
    .filter((p) => !featuredPost || p.slug !== featuredPost.slug)
    .slice(0, 4);

  return (
    <div className="editorial-home">

      {/* ── Featured story ── */}
      {featuredPost && (
        <section className="featured-dispatch">
          <div className="featured-dispatch-inner">
            <Link href={`/posts/${featuredPost.slug}`} className="featured-dispatch-image-wrap">
              {featuredPost.hero_image ? (
                <img
                  src={featuredPost.hero_image}
                  alt={featuredPost.title}
                  className="featured-dispatch-img"
                />
              ) : (
                <div className="featured-dispatch-img-placeholder" />
              )}
              <div className="featured-dispatch-scrim" />
            </Link>

            <div className="featured-dispatch-body">
              <div className="featured-dispatch-kicker">
                <span className="featured-dispatch-cat">{featuredPost.category}</span>
                <span className="featured-dispatch-label">Featured dispatch</span>
              </div>

              <h2 className="featured-dispatch-title">
                <Link href={`/posts/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="featured-dispatch-excerpt">{featuredPost.excerpt}</p>

              <div className="featured-dispatch-meta">
                By Irene W · {featuredPost.read_time ?? "8 min read"} · {formatDate(featuredPost.published_at)}
              </div>

              <Link href={`/posts/${featuredPost.slug}`} className="featured-dispatch-cta">
                Read dispatch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Recent dispatches grid ── */}
      {gridPosts.length > 0 && (
        <section className="dispatches-section">
          <div className="dispatches-section-inner">
            <div className="dispatches-head">
              <h2 className="dispatches-title">Recent Dispatches</h2>
              <Link href="/archive" className="dispatches-view-all">
                View all dispatches →
              </Link>
            </div>

            <div className="dispatches-grid">
              {gridPosts.map((post) => (
                <article key={post.slug} className="dispatch-card">
                  <Link href={`/posts/${post.slug}`} className="dispatch-card-image-wrap">
                    {post.hero_image ? (
                      <img
                        src={post.hero_image}
                        alt={post.title}
                        className="dispatch-card-img"
                      />
                    ) : (
                      <div className="dispatch-card-img-placeholder" />
                    )}
                  </Link>

                  <div className="dispatch-card-body">
                    <div className="dispatch-card-kicker">{post.category}</div>

                    <h3 className="dispatch-card-title">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="dispatch-card-excerpt">{post.excerpt}</p>

                    <div className="dispatch-card-meta">
                      {post.read_time ?? "8 min read"} · {formatDate(post.published_at)}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Editors picks — below the grid, as a slim horizontal strip */}
            {editorsPicks.length > 0 && (
              <div className="editors-picks-strip">
                <div className="editors-picks-label">Editor&apos;s Picks</div>
                <div className="editors-picks-list">
                  {editorsPicks.map((post) => (
                    <Link key={post.slug} href={`/posts/${post.slug}`} className="editors-pick-item">
                      <span className="editors-pick-cat">{post.category}</span>
                      <span className="editors-pick-title">{post.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* About this journal quote */}
            {(settings?.quote_text) && (
              <div className="journal-quote">
                <blockquote className="journal-quote-text">
                  {settings.quote_text}
                </blockquote>
                <cite className="journal-quote-name">— {settings.quote_author || "Irene W"}</cite>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}