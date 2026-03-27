export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ReadingProgress from "../../components/ReadingProgress";
import GalleryLightbox from "../../components/GalleryLightbox";
import { createSupabaseServerClient } from "../../lib/supabase-server";

type PostPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean)
    : [];

  const image =
    post.hero_image ||
    galleryImages[0] ||
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80";

  const description = post.excerpt || "A dispatch from Surface Interval.";

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: PostPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPreview = preview === "1" && !!user;

  let query = supabase.from("posts").select("*").eq("slug", slug);

  if (!isPreview) {
    query = query.eq("status", "published");
  }

  const { data: post } = await query.single();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!post) return notFound();

  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean)
    : [];

  const isGallery = post.post_type === "gallery";

  let relatedQuery = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .neq("slug", post.slug)
    .order("published_at", { ascending: false })
    .limit(3);

  if (post.series) {
    relatedQuery = relatedQuery.eq("series", post.series);
  } else {
    relatedQuery = relatedQuery.eq("category", post.category);
  }

  const { data: relatedRaw } = await relatedQuery;
  const relatedPosts = relatedRaw ?? [];

  const metadataItems = [
    { label: "Series", value: post.series },
    { label: "Location", value: post.location },
    { label: "Gear", value: post.gear },
    { label: "Camera", value: post.camera },
  ].filter((item) => item.value);

  return (
    <>
      <Header />
      <ReadingProgress />

      <main className="post-shell">
        {isPreview && post.status !== "published" ? (
          <div className="preview-banner">Preview Mode · Draft Post</div>
        ) : null}

        {post.hero_image ? (
          <div className="post-hero">
            <img src={post.hero_image} alt={post.title} />
          </div>
        ) : null}

        <div className="post-head">
          <div className="post-meta">
            {post.category} · {post.read_time || "8 min read"}
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-standfirst">{post.excerpt}</div>

          {metadataItems.length > 0 ? (
            <div className="post-data-grid">
              {metadataItems.map((item) => (
                <div key={item.label} className="post-data-item">
                  <div className="post-data-label">{item.label}</div>
                  <div className="post-data-value">{item.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {isGallery && galleryImages.length > 0 ? (
          <GalleryLightbox images={galleryImages} title={post.title} />
        ) : null}

        <article className="prose prose-editorial">
          {post.dive_log ? (
            <div className="field-note">
              <div className="field-note-label">Field Note</div>
              <div className="field-note-body">{post.dive_log}</div>
            </div>
          ) : null}

          {Array.isArray(post.body) &&
            post.body.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}

          {!isGallery && post.inline_image ? (
            <div className="inline-media inline-media-wide">
              <img src={post.inline_image} alt={post.title} />
            </div>
          ) : null}

          {post.tags && post.tags.length > 0 ? (
            <div className="post-tags">
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
        </article>

        {relatedPosts.length > 0 ? (
          <section className="related-posts">
            <div className="section-head">
              <div className="section-title">
                {post.series ? `More from ${post.series}` : "Related Dispatches"}
              </div>
            </div>

            <div className="posts related-posts-grid">
              {relatedPosts.map((item) => (
                <article key={item.id} className="post-card">
                  {item.hero_image ? (
                    <img src={item.hero_image} alt={item.title} />
                  ) : (
                    <div className="post-card-placeholder" />
                  )}

                  <div className="post-meta">
                    <div className="post-category">{item.category}</div>

                    <h2 className="post-title">
                      <Link href={`/posts/${item.slug}`}>{item.title}</Link>
                    </h2>

                    <div className="post-desc">{item.excerpt}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer settings={settings} />
    </>
  );
}