import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { quickUpdatePost } from "./actions";

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`admin-badge ${status === "published" ? "is-published" : "is-draft"}`}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

function FlagBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "featured" | "pick";
}) {
  return (
    <span className={`admin-badge ${tone === "featured" ? "is-featured" : tone === "pick" ? "is-pick" : ""}`}>
      {children}
    </span>
  );
}

function AdminBanner({
  created, saved, duplicated, deleted,
}: {
  created?: string; saved?: string; duplicated?: string; deleted?: string;
}) {
  const text = created ? "Post created." : saved ? "Changes saved." : duplicated ? "Draft duplicated." : deleted ? "Post deleted." : "";
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

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Posts</h2>
          <p>Manage publishing status and homepage placement from one view.</p>
        </div>
      </div>

      <AdminBanner {...params} />

      <div className="apt-wrap">
        <table className="apt-table">
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "19%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Homepage</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => {
              async function action(formData: FormData) {
                "use server";
                await quickUpdatePost(post.id, formData);
              }

              const badges: React.ReactNode[] = [];
              if (post.is_featured) badges.push(<FlagBadge key="f" tone="featured">Featured</FlagBadge>);
              if (post.is_editors_pick) badges.push(
                <FlagBadge key="p" tone="pick">
                  Pick{post.editors_pick_order != null ? ` #${post.editors_pick_order}` : ""}
                </FlagBadge>
              );

              return (
                <tr key={post.id}>
                  {/* Title */}
                  <td>
                    <div className="apt-title">{post.title}</div>
                    <div className="apt-slug">/posts/{post.slug}</div>
                  </td>

                  {/* Category */}
                  <td className="apt-cat">{post.category}</td>

                  {/* Status */}
                  <td><StatusBadge status={post.status} /></td>

                  {/* Homepage flags */}
                  <td>
                    <div className="apt-flags">
                      {badges.length > 0 ? badges : <span className="apt-none">—</span>}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="apt-date">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                      : "—"}
                  </td>

                  {/* Actions + inline quick-edit */}
                  <td>
                    <div className="apt-actions">
                      <Link href={`/admin/edit/${post.id}`} className="apt-btn">Edit</Link>
                      <Link href={`/posts/${post.slug}`} target="_blank" className="apt-btn">View</Link>
                    </div>

                    {/* Compact quick-edit — single row */}
                    <form action={action} className="apt-qe">
                      <select name="status" defaultValue={post.status} className="apt-qe-select">
                        <option value="draft">Draft</option>
                        <option value="published">Pub</option>
                      </select>

                      <label className="apt-qe-check" title="Featured">
                        <input type="checkbox" name="featured" defaultChecked={!!post.is_featured} />
                        <span>Feat</span>
                      </label>

                      <label className="apt-qe-check" title="Editor's Pick">
                        <input type="checkbox" name="editorsPick" defaultChecked={!!post.is_editors_pick} />
                        <span>Pick</span>
                      </label>

                      <input
                        type="number"
                        name="editorsPickOrder"
                        defaultValue={post.editors_pick_order ?? ""}
                        placeholder="#"
                        min="1"
                        className="apt-qe-num"
                        title="Pick order"
                      />

                      <button type="submit" className="apt-qe-apply">Apply</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}