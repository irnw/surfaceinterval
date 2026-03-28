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
import { parseBody, Block, TextBlock, ImageBlock } from "../../lib/block-types";

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
  const { data: post } = await supabase.from("posts").select("*")
    .eq("slug", slug).eq("status", "published").single();
  if (!post) return { title: "Post not found" };
  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean) : [];
  const image = post.hero_image || galleryImages[0] ||
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80";
  return {
    title: post.title,
    description: post.excerpt || "A dispatch from Surface Interval.",
    openGraph: {
      title: post.title, description: post.excerpt || "A dispatch from Surface Interval.",
      type: "article", images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image", title: post.title,
      description: post.excerpt || "A dispatch from Surface Interval.", images: [image],
    },
  };
}

// Render a single image block with layout
function RenderImageBlock({ block }: { block: ImageBlock }) {
  if (!block.url) return null;

  return (
    <div className={`post-block-image post-block-image--${block.layout}`}>
      <div className="post-block-image-inner">
        <img src={block.url} alt={block.alt || block.caption || ""} />
        {block.caption && (
          <div className="post-block-caption">{block.caption}</div>
        )}
      </div>
    </div>
  );
}

// Render all blocks, grouping consecutive "pair" images into a side-by-side row
function RenderBlocks({ blocks }: { blocks: Block[] }) {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "text") {
      const textBlock = block as TextBlock;
      // Split content by newlines into paragraphs
      const paragraphs = textBlock.content.split("\n").filter((p) => p.trim());
      elements.push(
        <div key={block.id} className="post-block-text">
          {paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}
        </div>
      );
      i++;
    } else if (block.type === "image") {
      const imgBlock = block as ImageBlock;

      // Group consecutive pair blocks together
      if (imgBlock.layout === "pair") {
        const pairBlocks: ImageBlock[] = [imgBlock];
        while (
          i + pairBlocks.length < blocks.length &&
          blocks[i + pairBlocks.length].type === "image" &&
          (blocks[i + pairBlocks.length] as ImageBlock).layout === "pair"
        ) {
          pairBlocks.push(blocks[i + pairBlocks.length] as ImageBlock);
        }

        elements.push(
          <div key={block.id} className="post-block-pair">
            {pairBlocks.map((pb) => (
              <div key={pb.id} className="post-block-pair-item">
                <img src={pb.url} alt={pb.alt || pb.caption || ""} />
                {pb.caption && <div className="post-block-caption">{pb.caption}</div>}
              </div>
            ))}
          </div>
        );
        i += pairBlocks.length;
      } else {
        elements.push(<RenderImageBlock key={block.id} block={imgBlock} />);
        i++;
      }
    } else {
      i++;
    }
  }

  return <>{elements}</>;
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

  const { data: settings } = await supabase.from("settings").select("*")
    .order("id", { ascending: true }).limit(1).maybeSingle();

  if (!post) return notFound();

  const galleryImages: string[] = Array.isArray(post.gallery_images)
    ? post.gallery_images.filter(Boolean) : [];
  const galleryCaptions: string[] = Array.isArray(post.gallery_captions)
    ? post.gallery_captions : [];
  const isGallery = post.post_type === "gallery";

  // Parse body — handles both old string[] and new block[] formats
  const blocks = parseBody(post.body);

  return (
    <>
      <Header />
      <ReadingProgress />

      <main className="post-shell">
        {isPreview && post.status !== "published" ? (
          <div className="preview-banner">Preview Mode · Draft Post</div>
        ) : null}

        {/* Hero image — caption overlays inside */}
        {post.hero_image ? (
          <div className="post-hero">
            <img src={post.hero_image} alt={post.title} />
            {post.hero_image_caption ? (
              <div className="caption post-hero-caption">{post.hero_image_caption}</div>
            ) : null}
          </div>
        ) : null}

        <div className="post-head">
          <div className="post-meta">
            {post.category} · {post.read_time || "8 min read"}
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-standfirst">{post.excerpt}</div>
        </div>

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

          {/* Block renderer */}
          <RenderBlocks blocks={blocks} />

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

        <ShareButtons title={post.title} slug={post.slug} position="bottom" />
      </main>

      <Footer settings={settings} />
    </>
  );
}