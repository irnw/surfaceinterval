import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { quickUpdatePost } from "./actions";
import ApplyAllButton from "../components/ApplyAllButton";
import QuickEditRow from "../components/QuickEditRow";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "published" ? "is-published" :
    status === "scheduled" ? "is-scheduled" :
    "is-draft";
  const label =
    status === "published" ? "Published" :
    status === "scheduled" ? "Scheduled" : "Draft";
  return <span className={`admin-badge ${cls}`}>{label}</span>;
}

function FlagBadge({ children, tone = "default" }: {
  children: React.ReactNode;
  tone?: "default" | "featured" | "pick";
}) {
  return (
    <span className={`admin-badge ${
      tone === "featured" ? "is-featured" : tone === "pick" ? "is-pick" : ""
    }`}>{children}</span>
  );
}

function AdminBanner({ created, saved, duplicated, deleted }: {
  created?: string; saved?: string; duplicated?: string; deleted?: string;
}) {
  const text = created ? "Post created." : saved ? "Changes saved."
    : duplicated ? "Draft duplicated." : deleted ? "Post deleted." : "";
  if (!text) return null;
  return <div className="admin-banner">{text}</div>;
}

function formatScheduled(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
    + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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
        <ApplyAllButton />
      </div>

      <AdminBanner {...params} />

      <div className="apt-wrap">
        <table className="apt-table">
          <colgroup>
            <col style={{ width: "32%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "21%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Homepage</th>
              <th>Date</th>
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
                  <td>
                    <div className="apt-title">{post.title}</div>
                    <div className="apt-slug">/posts/{post.slug}</div>
                    {post.status === "scheduled" && post.scheduled_at && (
                      <div className="apt-schedule-row">⏰ {formatScheduled(post.scheduled_at)}</div>
                    )}
                  </td>
                  <td className="apt-cat">{post.category}</td>
                  <td><StatusBadge status={post.status} /></td>
                  <td>
                    <div className="apt-flags">
                      {badges.length > 0 ? badges : <span className="apt-none">—</span>}
                    </div>
                  </td>
                  <td className="apt-date">
                    {post.status === "published" && post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                      : "—"}
                  </td>
                  <td>
                    <div className="apt-actions">
                      <Link href={`/admin/edit/${post.id}`} className="apt-btn">Edit</Link>
                      <Link href={`/posts/${post.slug}`} target="_blank" className="apt-btn">View</Link>
                    </div>
                    {/* QuickEditRow is a client component so it can manage the schedule datetime expansion */}
                    <QuickEditRow
                      postId={post.id}
                      initialStatus={post.status}
                      initialFeatured={!!post.is_featured}
                      initialEditorsPick={!!post.is_editors_pick}
                      initialEditorsPickOrder={post.editors_pick_order ?? null}
                      initialScheduledAt={post.scheduled_at ?? ""}
                      action={action}
                    />
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