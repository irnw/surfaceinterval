"use client";

import Link from "next/link";

interface Post {
  id: string | number;
  title: string;
  slug: string;
  category?: string;
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface PostsTableProps {
  posts: Post[];
  onDelete?: (id: string | number) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export default function PostsTable({ posts, onDelete }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div style={{
        padding: "40px 0",
        textAlign: "center",
        color: "var(--muted)",
        fontSize: "0.84rem",
      }}>
        No posts yet. Create your first dispatch.
      </div>
    );
  }

  return (
    <div className="posts-table-wrap">
      <table className="posts-table">
        <colgroup>
          <col className="col-title" />
          <col className="col-cat" />
          <col className="col-status" />
          <col className="col-date" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const status = post.status ?? "draft";
            const dateStr =
              status === "published"
                ? post.published_at
                : post.updated_at ?? post.created_at;

            return (
              <tr key={post.id}>
                <td>
                  <div className="cell-title" title={post.title}>
                    {post.title}
                  </div>
                </td>
                <td>
                  <span className="cell-cat">{post.category ?? "—"}</span>
                </td>
                <td>
                  <span className={`status-pill ${status}`}>{status}</span>
                </td>
                <td>
                  <span className="cell-date">{formatDate(dateStr)}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="table-action-btn"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="table-action-btn"
                    >
                      View
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        className="table-action-btn danger"
                        onClick={() => {
                          if (confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                            onDelete(post.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}