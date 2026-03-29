"use client";

import { useState } from "react";
import Link from "next/link";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  is_featured: boolean;
  is_editors_pick: boolean;
  editors_pick_order: number | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
};

type PostAction = {
  postId: number;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
};

interface PostsManagerProps {
  posts: Post[];
  postActions: PostAction[];
}

const SGT_SLOTS = [{ label: "8 AM SGT", utcHour: 0 }];

function buildScheduledAt(date: string): string {
  if (!date) return "";
  return `${date}T00:00:00.000Z`;
}

function parseStoredDate(utcIso: string): string {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  const sgtMs = d.getTime() + 8 * 60 * 60 * 1000;
  return new Date(sgtMs).toISOString().slice(0, 10);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "2-digit"
  });
}

function formatScheduled(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
    + " · 8am SGT";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "pm-badge pm-badge--published",
    scheduled: "pm-badge pm-badge--scheduled",
    draft: "pm-badge pm-badge--draft",
  };
  const labels: Record<string, string> = {
    published: "Published", scheduled: "Scheduled", draft: "Draft"
  };
  return <span className={map[status] || "pm-badge pm-badge--draft"}>{labels[status] || status}</span>;
}

// Single post row with inline quick edit
function PostRow({
  post,
  updateAction,
  deleteAction,
  checked,
  onCheck,
}: {
  post: Post;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
  checked: boolean;
  onCheck: (id: number, checked: boolean) => void;
}) {
  const [status, setStatus] = useState(post.status);
  const [featured, setFeatured] = useState(post.is_featured);
  const [editorsPick, setEditorsPick] = useState(post.is_editors_pick);
  const [pickOrder, setPickOrder] = useState(post.editors_pick_order?.toString() ?? "");
  const [scheduleDate, setScheduleDate] = useState(parseStoredDate(post.scheduled_at ?? ""));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const todaySGT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const isScheduled = status === "scheduled";

  async function handleApply() {
    if (isScheduled && !scheduleDate) { alert("Choose a publish date."); return; }
    setSaving(true);
    const fd = new FormData();
    fd.set("status", status);
    fd.set("scheduledAt", isScheduled ? buildScheduledAt(scheduleDate) : "");
    fd.set("tzOffset", "0");
    fd.set("featured", featured ? "on" : "");
    fd.set("editorsPick", editorsPick ? "on" : "");
    fd.set("editorsPickOrder", pickOrder);
    await updateAction(fd);
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteAction();
  }

  return (
    <div className={`pm-row ${checked ? "pm-row--checked" : ""}`}>
      {/* Checkbox */}
      <div className="pm-row-check">
        <input
          type="checkbox"
          className="pm-checkbox"
          checked={checked}
          onChange={(e) => onCheck(post.id, e.target.checked)}
        />
      </div>

      {/* Post info */}
      <div className="pm-row-info">
        <div className="pm-row-title">
          <Link href={`/admin/edit/${post.id}`} className="pm-title-link">
            {post.title}
          </Link>
          {post.is_featured && <span className="pm-flag pm-flag--feat">Featured</span>}
          {post.is_editors_pick && (
            <span className="pm-flag pm-flag--pick">
              Pick{post.editors_pick_order != null ? ` #${post.editors_pick_order}` : ""}
            </span>
          )}
        </div>
        <div className="pm-row-meta">
          <span className="pm-meta-cat">{post.category}</span>
          <span className="pm-meta-sep">·</span>
          <span className="pm-meta-slug">/posts/{post.slug}</span>
          {post.status === "scheduled" && post.scheduled_at && (
            <>
              <span className="pm-meta-sep">·</span>
              <span className="pm-meta-sched">⏰ {formatScheduled(post.scheduled_at)}</span>
            </>
          )}
          {post.status === "published" && (
            <>
              <span className="pm-meta-sep">·</span>
              <span className="pm-meta-date">{formatDate(post.published_at)}</span>
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="pm-row-status">
        <StatusBadge status={post.status} />
      </div>

      {/* Action buttons */}
      <div className="pm-row-actions">
        <Link href={`/admin/edit/${post.id}`} className="pm-action-btn">Edit</Link>
        <Link href={`/posts/${post.slug}`} target="_blank" className="pm-action-btn">View</Link>
        {!confirmDelete ? (
          <button
            type="button"
            className="pm-action-btn pm-action-btn--delete"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        ) : (
          <span className="pm-delete-confirm">
            <span className="pm-delete-confirm-label">Sure?</span>
            <button
              type="button"
              className="pm-action-btn pm-action-btn--delete-yes"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes"}
            </button>
            <button
              type="button"
              className="pm-action-btn"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </button>
          </span>
        )}
      </div>

      {/* Quick edit controls */}
      <div className="pm-row-qe">
        <div className="pm-qe-controls">
          <div className="pm-qe-field">
            <label className="pm-qe-label">Status</label>
            <select
              className="pm-qe-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <label className="pm-qe-toggle">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>Featured</span>
          </label>

          <label className="pm-qe-toggle">
            <input
              type="checkbox"
              checked={editorsPick}
              onChange={(e) => setEditorsPick(e.target.checked)}
            />
            <span>Editor's Pick</span>
          </label>

          {editorsPick && (
            <div className="pm-qe-field pm-qe-field--slim">
              <label className="pm-qe-label">Order</label>
              <input
                type="number"
                min="1"
                className="pm-qe-num"
                value={pickOrder}
                onChange={(e) => setPickOrder(e.target.value)}
                placeholder="#"
              />
            </div>
          )}

          <button
            type="button"
            className="pm-qe-apply"
            onClick={handleApply}
            disabled={saving}
          >
            {saving ? "Saving…" : "Apply"}
          </button>
        </div>

        {/* Schedule date — only shown when scheduled */}
        {isScheduled && (
          <div className="pm-qe-schedule">
            <label className="pm-qe-label">Publish on</label>
            <input
              type="date"
              className="pm-qe-date"
              value={scheduleDate}
              min={todaySGT}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <span className="pm-qe-slot">8:00 AM SGT</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsManager({ posts, postActions }: PostsManagerProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [bulkScheduleDate, setBulkScheduleDate] = useState("");
  const [bulkApplying, setBulkApplying] = useState(false);

  const allChecked = selected.size === posts.length && posts.length > 0;
  const someChecked = selected.size > 0;
  const todaySGT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

  function toggleAll(checked: boolean) {
    if (checked) setSelected(new Set(posts.map((p) => p.id)));
    else setSelected(new Set());
  }

  function toggleOne(id: number, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  function getAction(postId: number) {
    return postActions.find((a) => a.postId === postId);
  }

  async function handleBulkStatusChange(newStatus: string) {
    if (selected.size === 0) return;
    if (newStatus === "scheduled" && !bulkScheduleDate) {
      alert("Please choose a date for scheduled posts.");
      return;
    }
    setBulkApplying(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => {
      const action = getAction(id);
      if (!action) return Promise.resolve();
      const fd = new FormData();
      fd.set("status", newStatus);
      fd.set("scheduledAt", newStatus === "scheduled" ? buildScheduledAt(bulkScheduleDate) : "");
      fd.set("tzOffset", "0");
      return action.updateAction(fd);
    }));
    setBulkApplying(false);
    setSelected(new Set());
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} post${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkApplying(true);
    const ids = Array.from(selected);
    // Delete sequentially to avoid race conditions
    for (const id of ids) {
      const action = getAction(id);
      if (action) await action.deleteAction();
    }
    setBulkApplying(false);
    setSelected(new Set());
  }

  return (
    <div className="pm-root">
      {/* Header */}
      <div className="pm-head">
        <div className="pm-head-left">
          <h2 className="pm-title">Posts</h2>
          <span className="pm-count">{posts.length} total</span>
        </div>
        <div className="pm-head-right">
          <Link href="/admin/new" className="pm-new-btn">+ New Post</Link>
        </div>
      </div>

      {/* Bulk action bar — slides in when posts selected */}
      {someChecked && (
        <div className="pm-bulk-bar">
          <span className="pm-bulk-count">
            {selected.size} selected
          </span>
          <div className="pm-bulk-actions">
            <button
              type="button"
              className="pm-bulk-btn"
              onClick={() => handleBulkStatusChange("draft")}
              disabled={bulkApplying}
            >
              → Draft
            </button>
            <button
              type="button"
              className="pm-bulk-btn"
              onClick={() => handleBulkStatusChange("published")}
              disabled={bulkApplying}
            >
              → Publish
            </button>
            <div className="pm-bulk-schedule">
              <input
                type="date"
                className="pm-bulk-date"
                value={bulkScheduleDate}
                min={todaySGT}
                onChange={(e) => setBulkScheduleDate(e.target.value)}
                placeholder="Date"
              />
              <button
                type="button"
                className="pm-bulk-btn"
                onClick={() => handleBulkStatusChange("scheduled")}
                disabled={bulkApplying}
              >
                → Schedule
              </button>
            </div>
            <button
              type="button"
              className="pm-bulk-btn pm-bulk-btn--delete"
              onClick={handleBulkDelete}
              disabled={bulkApplying}
            >
              Delete Selected
            </button>
          </div>
          <button
            type="button"
            className="pm-bulk-clear"
            onClick={() => setSelected(new Set())}
          >
            ✕
          </button>
        </div>
      )}

      {/* Column header row */}
      <div className="pm-col-head">
        <div className="pm-col-check">
          <input
            type="checkbox"
            className="pm-checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
            title="Select all"
          />
        </div>
        <div className="pm-col-title">Post</div>
        <div className="pm-col-status">Status</div>
        <div className="pm-col-actions">Actions</div>
      </div>

      {/* Post rows */}
      <div className="pm-list">
        {posts.length === 0 ? (
          <div className="pm-empty">
            No posts yet. <Link href="/admin/new">Create your first post →</Link>
          </div>
        ) : (
          posts.map((post) => {
            const action = getAction(post.id);
            if (!action) return null;
            return (
              <PostRow
                key={post.id}
                post={post}
                updateAction={action.updateAction}
                deleteAction={action.deleteAction}
                checked={selected.has(post.id)}
                onCheck={toggleOne}
              />
            );
          })
        )}
      </div>
    </div>
  );
}