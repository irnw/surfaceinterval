import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { updatePost, deletePost, duplicatePost } from "../../actions";
import PostEditorForm from "../../../components/PostEditorForm";
import ConfirmActionForm from "../../../components/ConfirmActionForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!post) return notFound();

  async function action(formData: FormData) {
    "use server";
    await updatePost(Number(id), formData);
  }

  async function duplicateAction() {
    "use server";
    await duplicatePost(Number(id));
  }

  async function deleteAction() {
    "use server";
    await deletePost(Number(id));
  }

  return (
    <div className="admin-panel">
      <div className="panel-head" style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <h2>Edit Post</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/posts/${post.slug}?preview=1`} className="nav-pill">
            Preview Draft
          </Link>
        </div>
      </div>

      <PostEditorForm
        onSubmit={action}
        initial={{
          title: post.title,
          slug: post.slug,
          category: post.category,
          excerpt: post.excerpt,
          // Pass raw body — PostEditorForm uses parseBody() to handle both formats
          body: post.body,
          hero: post.hero_image ?? "",
          heroCaption: post.hero_image_caption ?? "",
          inline: post.inline_image ?? "",
          inlineCaption: post.inline_image_caption ?? "",
          galleryImages: post.gallery_images ?? [],
          galleryCaptions: post.gallery_captions ?? [],
          postType: post.post_type ?? "standard",
          readTime: post.read_time ?? "",
          status: post.status,
          featured: post.is_featured ?? false,
          editorsPick: post.is_editors_pick ?? false,
          editorsPickOrder: post.editors_pick_order ?? null,
          existingPublishedAt: post.published_at ?? "",
          scheduledAt: post.scheduled_at ?? "",
          tags: post.tags ?? [],
          series: post.series ?? "",
          location: post.location ?? "",
          gear: post.gear ?? "",
          camera: post.camera ?? "",
          diveLog: post.dive_log ?? "",
        }}
      />

      <div className="editor-secondary-actions">
        <form action={duplicateAction}>
          <button type="submit">Duplicate Post</button>
        </form>
        <ConfirmActionForm
          action={deleteAction}
          label="Delete Post"
          message="Are you sure you want to delete this post?"
          className="danger-button"
        />
      </div>
    </div>
  );
}