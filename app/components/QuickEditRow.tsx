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

const SGT_SLOTS = [
  { label: "8 AM", utcHour: 0 },
];

function buildScheduledAt(date: string, slotIndex: number): string {
  if (!date) return "";
  const utcHour = SGT_SLOTS[slotIndex].utcHour;
  return `${date}T${String(utcHour).padStart(2, "0")}:00:00.000Z`;
}

function parseStoredSchedule(utcIso: string): { date: string; slotIndex: number } {
  if (!utcIso) return { date: "", slotIndex: 0 };
  const d = new Date(utcIso);
  const sgtMs = d.getTime() + 8 * 60 * 60 * 1000;
  const sgt = new Date(sgtMs);
  const date = sgt.toISOString().slice(0, 10);
  const slotIndex = d.getUTCHours() >= 12 ? 1 : 0;
  return { date, slotIndex };
}

export default function QuickEditRow({
  postId, initialStatus, initialFeatured, initialEditorsPick,
  initialEditorsPickOrder, initialScheduledAt, action,
}: QuickEditRowProps) {
  const [status, setStatus] = useState(initialStatus);
  const parsed = parseStoredSchedule(initialScheduledAt);
  const [scheduleDate, setScheduleDate] = useState(parsed.date);
  const [scheduleSlot, setScheduleSlot] = useState(parsed.slotIndex);

  const todaySGT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const isScheduled = status === "scheduled";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isScheduled && !scheduleDate) {
      alert("Please choose a publish date.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("status", status);
    fd.set("scheduledAt", isScheduled ? buildScheduledAt(scheduleDate, scheduleSlot) : "");
    fd.set("tzOffset", "0");
    await action(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="apt-qe" data-quick-edit data-post-id={postId}>
      <div className="apt-qe-controls">
        <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="apt-qe-select">
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

        <input type="number" name="editorsPickOrder"
          defaultValue={initialEditorsPickOrder ?? ""}
          placeholder="#" min="1" className="apt-qe-num" title="Pick order" />

        <button type="submit" className="apt-qe-apply">Apply</button>
      </div>

      {/* Schedule row — date + 8am/8pm slot buttons */}
      {isScheduled && (
        <div className="apt-qe-schedule-row">
          <input
            type="date"
            className="apt-qe-schedule-input"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={todaySGT}
          />
          <div className="apt-qe-slots">
            {SGT_SLOTS.map((slot, i) => (
              <button
                key={slot.label}
                type="button"
                className={`apt-qe-slot-btn ${scheduleSlot === i ? "is-active" : ""}`}
                onClick={() => setScheduleSlot(i)}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}