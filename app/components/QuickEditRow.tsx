"use client";

import { useState } from "react";

interface QuickEditRowProps {
  postId: number;
  initialStatus: string;
  initialFeatured: boolean;
  initialEditorsPick: boolean;
  initialEditorsPickOrder: number | null;
  initialScheduledAt: string;
  action: (formData: FormData) => unknown;
}

export default function QuickEditRow({
  postId,
  initialStatus,
  initialFeatured,
  initialEditorsPick,
  initialEditorsPickOrder,
  initialScheduledAt,
  action,
}: QuickEditRowProps) {
  const [status, setStatus] = useState(initialStatus);
  const [scheduledAt, setScheduledAt] = useState(
    initialScheduledAt
      ? new Date(initialScheduledAt).toISOString().slice(0, 16)
      : ""
  );

  const isScheduled = status === "scheduled";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isScheduled && !scheduledAt) {
      alert("Please set a publish date and time.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("status", status);
    fd.set("scheduledAt", scheduledAt);
    // ✅ Send browser timezone offset in minutes so server can convert correctly
    fd.set("tzOffset", String(new Date().getTimezoneOffset()));
    await action(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="apt-qe" data-quick-edit data-post-id={postId}>
      <div className="apt-qe-controls">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="apt-qe-select"
        >
          <option value="draft">Draft</option>
          <option value="published">Pub</option>
          <option value="scheduled">Sched</option>
        </select>

        <label className="apt-qe-check" title="Featured">
          <input type="checkbox" name="featured" defaultChecked={initialFeatured} />
          <span>Feat</span>
        </label>

        <label className="apt-qe-check" title="Editor's Pick">
          <input type="checkbox" name="editorsPick" defaultChecked={initialEditorsPick} />
          <span>Pick</span>
        </label>

        <input
          type="number"
          name="editorsPickOrder"
          defaultValue={initialEditorsPickOrder ?? ""}
          placeholder="#"
          min="1"
          className="apt-qe-num"
          title="Pick order"
        />

        <button type="submit" className="apt-qe-apply">Apply</button>
      </div>

      {isScheduled && (
        <div className="apt-qe-schedule-row">
          <label className="apt-qe-schedule-label">Publish at</label>
          <input
            type="datetime-local"
            className="apt-qe-schedule-input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}
    </form>
  );
}