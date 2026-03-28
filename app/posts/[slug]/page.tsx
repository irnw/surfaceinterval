export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ReadingProgress from "../../components/ReadingProgress";
import GalleryLightbox from "../../components/GalleryLightbox";
import ShareButtons from "../../components/ShareButtons";
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

  if (!post) return { title: "Post not found" };

  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean)
    : [];

  const image =
    post.hero_image ||
    galleryImages[0] ||
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80";

  return {
    title: post.title,
    description: post.excerpt || "A dispatch from Surface Interval.",
    openGraph: {
      title: post.title,
      description: post.excerpt || "A dispatch from Surface Interval.",
      type: "article",
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "A dispatch from Surface Interval.",
      images: [image],
    },
  };
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isPreview = preview === "1" && !!user;

  let query = supabase.from("posts").select("*").eq("slug", slug);
  if (!isPreview) query = query.eq("status", "published");

  const { data: post } = await query.single();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!post) return notFound();

  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean)
    : [];

  const galleryCaptions: string[] = Array.isArray(post.gallery_captions)
    ? post.gallery_captions
    : [];

  const isGallery = post.post_type === "gallery";

  return (
    <>
      <Header />
      <ReadingProgress />

      <main className="post-shell">
        {isPreview && post.status !== "published" ? (
          <div className="preview-banner">Preview Mode · Draft Post</div>
        ) : null}

        {post.hero_image ? (
          <>
            <div className="post-hero">
              <img src={post.hero_image} alt={post.title} />
            </div>
            {post.hero_image_caption ? (
              <div className="caption post-hero-caption">{post.hero_image_caption}</div>
            ) : null}
          </>
        ) : null}

        <div className="post-head">
          <div className="post-meta">
            {post.category} · {post.read_time || "8 min read"}
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-standfirst">{post.excerpt}</div>
        </div>

        {/* ── Share buttons — top ── */}
        <ShareButtons title={post.title} slug={post.slug} position="top" />

        {isGallery && galleryImages.length > 0 ? (
          <>
            <GalleryLightbox images={galleryImages} title={post.title} />
            {galleryCaptions.length > 0 ? (
              <div className="gallery-caption-list">
                {galleryCaptions.map((caption, index) => (
                  <div key={`${caption}-${index}`} className="caption">{caption}</div>
                ))}
              </div>
            ) : null}
          </>
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
              {post.inline_image_caption ? (
                <div className="caption">{post.inline_image_caption}</div>
              ) : null}
            </div>
          ) : null}

          {post.tags && post.tags.length > 0 ? (
            <div className="post-tags">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag">
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        {/* ── Share buttons — bottom ── */}
        <ShareButtons title={post.title} slug={post.slug} position="bottom" />
      </main>

      <Footer settings={settings} />
    </>
  );
}