import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { quickUpdatePost } from "./actions";

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";

  return (
    <span className={`admin-badge ${isPublished ? "is-published" : "is-draft"}`}>
      {isPublished ? "Published" : "Draft"}
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
    <span
      className={`admin-badge ${
        tone === "featured" ? "is-featured" : tone === "pick" ? "is-pick" : ""
      }`}
    >
      {children}
    </span>
  );
}

function AdminBanner({
  created,
  saved,
  duplicated,
  deleted,
}: {
  created?: string;
  saved?: string;
  duplicated?: string;
  deleted?: string;
}) {
  let text = "";
  if (created) text = "Post created.";
  if (saved) text = "Changes saved.";
  if (duplicated) text = "Draft duplicated.";
  if (deleted) text = "Post deleted.";
  if (!text) return null;

  return <div className="admin-banner">{text}</div>;
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    duplicated?: string;
    deleted?: string;
  }>;
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
        <div className="admin-panel-head">
          <div>
            <h2>Posts</h2>
            <p>Error loading posts.</p>
          </div>
        </div>
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

      <div className="admin-table-shell">
        <div className="table-wrap">
          <table className="admin-table">
            <colgroup>
              <col style={{ width: "31%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "17%" }} />
            </colgroup>

            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Homepage</th>
                <th>Published</th>
                <th>Quick Edit</th>
              </tr>
            </thead>

            <tbody>
              {posts?.map((post) => {
                async function action(formData: FormData) {
                  "use server";
                  await quickUpdatePost(post.id, formData);
                }

                const homepageBadges: React.ReactNode[] = [];

                if (post.is_featured) {
                  homepageBadges.push(
                    <FlagBadge key="featured" tone="featured">
                      Featured
                    </FlagBadge>
                  );
                }

                if (post.is_editors_pick) {
                  homepageBadges.push(
                    <FlagBadge key="pick" tone="pick">
                      Editor&apos;s Pick
                      {post.editors_pick_order != null
                        ? ` #${post.editors_pick_order}`
                        : ""}
                    </FlagBadge>
                  );
                }

                if (homepageBadges.length === 0) {
                  homepageBadges.push(<FlagBadge key="none">None</FlagBadge>);
                }

                return (
                  <tr key={post.id}>
                    <td>
                      <div className="admin-title-cell">
                        <div className="admin-post-title">{post.title}</div>
                        <div className="admin-post-slug">/posts/{post.slug}</div>
                      </div>
                    </td>

                    <td className="admin-muted-cell">{post.category}</td>

                    <td>
                      <StatusBadge status={post.status} />
                    </td>

                    <td>
                      <div className="admin-badge-stack">{homepageBadges}</div>
                    </td>

                    <td className="admin-muted-cell">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>

                    <td>
                      <form action={action} className="admin-quick-form">
                        <div className="admin-quick-grid">
                          <div className="admin-quick-field">
                            <span>Status</span>
                            <select name="status" defaultValue={post.status}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </div>

                          <div className="admin-quick-field">
                            <span>Editor&apos;s Pick Order</span>
                            <input
                              type="number"
                              min="1"
                              name="editorsPickOrder"
                              defaultValue={post.editors_pick_order ?? ""}
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <div className="admin-check-row">
                          <label className="admin-checkline">
                            <input
                              type="checkbox"
                              name="featured"
                              defaultChecked={!!post.is_featured}
                            />
                            Featured
                          </label>

                          <label className="admin-checkline">
                            <input
                              type="checkbox"
                              name="editorsPick"
                              defaultChecked={!!post.is_editors_pick}
                            />
                            Editor&apos;s Pick
                          </label>
                        </div>

                        <div className="admin-post-actions">
                          <button type="submit">Apply</button>

                          <Link
                            href={`/admin/edit/${post.id}`}
                            className="admin-edit-link"
                          >
                            Edit
                          </Link>
                        </div>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}