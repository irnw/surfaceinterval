import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { quickUpdatePost, deletePost } from "./actions";
import PostsManager from "../components/PostsManager";

function AdminBanner({ created, saved, duplicated, deleted }: {
  created?: string; saved?: string; duplicated?: string; deleted?: string;
}) {
  const text = created ? "Post created." : saved ? "Changes saved."
    : duplicated ? "Draft duplicated." : deleted ? "Post deleted." : "";
  if (!text) return null;
  return <div className="admin-banner">{text}</div>;
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string; duplicated?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="admin-panel">
        <p style={{ color: "var(--muted)", padding: "24px 0" }}>Error loading posts.</p>
      </div>
    );
  }

  // Build per-post server actions
  const postActions = (posts ?? []).map((post) => {
    async function updateAction(formData: FormData) {
      "use server";
      await quickUpdatePost(post.id, formData);
    }
    async function deleteAction() {
      "use server";
      await deletePost(post.id);
    }
    return { postId: post.id, updateAction, deleteAction };
  });

  return (
    <div className="admin-panel">
      <AdminBanner {...params} />
      <PostsManager
        posts={posts ?? []}
        postActions={postActions}
      />
    </div>
  );
}