import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  excerpt?: string | null;
  hero_image?: string | null;
  category?: string | null;
  read_time?: string | null;
  published_at?: string | null;
};

export default function FeatureBand({
  featuredPost,
}: {
  featuredPost: Post | null;
}) {
  if (!featuredPost) return null;

  const image =
    featuredPost.hero_image ||
    "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1400&q=80";

  const metaParts = [
    featuredPost.category,
    featuredPost.read_time,
    featuredPost.published_at
      ? new Date(featuredPost.published_at).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : null,
  ].filter(Boolean);

  return (
    <section className="feature">
      <div className="feature-band">
        <div className="feature-copy">
          <div className="feature-eyebrow">Featured Story</div>

          <h2>{featuredPost.title}</h2>

          {metaParts.length > 0 ? (
            <div
              style={{
                marginTop: 16,
                fontSize: "0.66rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {metaParts.join(" · ")}
            </div>
          ) : null}

          <p>
            {featuredPost.excerpt ||
              "A featured dispatch from the archive."}
          </p>

          <div style={{ marginTop: 22 }}>
            <Link href={`/posts/${featuredPost.slug}`} className="nav-pill">
              Read Story
            </Link>
          </div>
        </div>

        <div
          className="feature-visual"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
    </section>
  );
}