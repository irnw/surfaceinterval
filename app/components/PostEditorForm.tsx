"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaLibrary from "./MediaLibrary";
import BlockEditor from "./BlockEditor";
import { Block, parseBody } from "../lib/block-types";

type Props = {
  initial?: {
    title?: string; slug?: string; category?: string; excerpt?: string;
    body?: unknown; hero?: string; heroCaption?: string; inline?: string;
    inlineCaption?: string; galleryImages?: string[]; galleryCaptions?: string[];
    postType?: string; readTime?: string; status?: string; featured?: boolean;
    editorsPick?: boolean; editorsPickOrder?: number | null;
    existingPublishedAt?: string; scheduledAt?: string;
    tags?: string[]; series?: string; location?: string;
    gear?: string; camera?: string; diveLog?: string;
  };
  onSubmit: (formData: FormData) => unknown;
};

const categories = ["Diving", "Travel", "Gear", "Personal"];

// SGT = UTC+8, so:
// 8am SGT  = 00:00 UTC
// 8pm SGT  = 12:00 UTC
const SGT_SLOTS = [
  { label: "8:00 AM (SGT)", utcHour: 0 },
];

/**
 * Given a stored UTC ISO string, extract the date (YYYY-MM-DD in SGT)
 * and which slot (0 = 8am, 1 = 8pm) it corresponds to.
 */
function parseStoredSchedule(utcIso: string): { date: string; slotIndex: number } {
  if (!utcIso) return { date: "", slotIndex: 0 };
  const d = new Date(utcIso);
  // Convert to SGT (UTC+8)
  const sgtMs = d.getTime() + 8 * 60 * 60 * 1000;
  const sgt = new Date(sgtMs);
  const date = sgt.toISOString().slice(0, 10); // YYYY-MM-DD
  const utcHour = d.getUTCHours();
  const slotIndex = utcHour >= 12 ? 1 : 0;
  return { date, slotIndex };
}

/**
 * Build UTC ISO from a SGT date string + slot index.
 */
function buildScheduledAt(date: string, slotIndex: number): string {
  if (!date) return "";
  const utcHour = SGT_SLOTS[slotIndex].utcHour;
  return `${date}T${String(utcHour).padStart(2, "0")}:00:00.000Z`;
}

function Section({ label, children, defaultOpen = false }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pef-section">
      <button type="button" className="pef-section-toggle"
        onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="pef-section-label">{label}</span>
        <span className="pef-section-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="pef-section-body">{children}</div>}
    </div>
  );
}

export default function PostEditorForm({ initial, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [hero, setHero] = useState(initial?.hero || "");
  const [heroCaption, setHeroCaption] = useState(initial?.heroCaption || "");
  const [inline, setInline] = useState(initial?.inline || "");
  const [inlineCaption, setInlineCaption] = useState(initial?.inlineCaption || "");
  const [galleryImages, setGalleryImages] = useState(initial?.galleryImages?.join(", ") || "");
  const [galleryCaptions, setGalleryCaptions] = useState(initial?.galleryCaptions?.join("\n") || "");
  const [postType, setPostType] = useState(initial?.postType || "standard");
  const [category, setCategory] = useState(initial?.category || "Diving");
  const [readTime, setReadTime] = useState(initial?.readTime || "");
  const [status, setStatus] = useState(initial?.status || "draft");

  // Schedule state — date + slot
  const parsedInitial = parseStoredSchedule(initial?.scheduledAt || "");
  const [scheduleDate, setScheduleDate] = useState(parsedInitial.date);
  const [scheduleSlot, setScheduleSlot] = useState(parsedInitial.slotIndex);

  const [featured, setFeatured] = useState(initial?.featured || false);
  const [editorsPick, setEditorsPick] = useState(initial?.editorsPick || false);
  const [editorsPickOrder, setEditorsPickOrder] = useState(
    initial?.editorsPickOrder != null ? String(initial.editorsPickOrder) : ""
  );
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [blocks, setBlocks] = useState<Block[]>(() => parseBody(initial?.body));
  const [series, setSeries] = useState(initial?.series || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [gear, setGear] = useState(initial?.gear || "");
  const [camera, setCamera] = useState(initial?.camera || "");
  const [diveLog, setDiveLog] = useState(initial?.diveLog || "");
  const [mediaTarget, setMediaTarget] = useState<"hero" | "inline" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const slugManuallyEdited = useRef(!!initial?.slug);

  const initialBlocksJson = useMemo(() => JSON.stringify(parseBody(initial?.body)), [initial?.body]);
  const isDirty =
    title !== (initial?.title || "") ||
    slug !== (initial?.slug || "") ||
    excerpt !== (initial?.excerpt || "") ||
    status !== (initial?.status || "draft") ||
    category !== (initial?.category || "Diving") ||
    JSON.stringify(blocks) !== initialBlocksJson;

  useEffect(() => {
    if (slugManuallyEdited.current) return;
    setSlug(title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"));
  }, [title]);

  useEffect(() => { if (!editorsPick) setEditorsPickOrder(""); }, [editorsPick]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty || submitting) return;
      e.preventDefault(); e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, submitting]);

  // Today's date in SGT for min date validation
  const todaySGT = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "scheduled" && !scheduleDate) {
      alert("Please choose a publish date.");
      return;
    }
    setSubmitting(true);
    const scheduledAt = status === "scheduled" ? buildScheduledAt(scheduleDate, scheduleSlot) : "";
    const fd = new FormData();
    fd.set("title", title); fd.set("slug", slug); fd.set("category", category);
    fd.set("excerpt", excerpt); fd.set("body", JSON.stringify(blocks));
    fd.set("hero", hero); fd.set("heroCaption", heroCaption);
    fd.set("inline", inline); fd.set("inlineCaption", inlineCaption);
    fd.set("galleryImages", galleryImages); fd.set("galleryCaptions", galleryCaptions);
    fd.set("postType", postType); fd.set("readTime", readTime);
    fd.set("status", status);
    // Send pre-built UTC ISO — no tzOffset needed since we handle conversion here
    fd.set("scheduledAt", scheduledAt);
    fd.set("tzOffset", "0"); // already UTC
    fd.set("featured", featured ? "true" : "false");
    fd.set("editorsPick", editorsPick ? "true" : "false");
    fd.set("editorsPickOrder", editorsPickOrder);
    fd.set("existingPublishedAt", initial?.existingPublishedAt || "");
    fd.set("tags", tags); fd.set("series", series); fd.set("location", location);
    fd.set("gear", gear); fd.set("camera", camera); fd.set("diveLog", diveLog);
    await onSubmit(fd);
  }

  const saveLabel = submitting ? "Saving…"
    : status === "scheduled" && scheduleDate ? "Schedule Post"
    : "Save Post";

  return (
    <>
      {isDirty && <div className="pef-dirty-bar">Unsaved changes</div>}

      <form onSubmit={handleSubmit} className="pef-form">
        <div className="pef-topbar">
          <div className="pef-field pef-field--title">
            <label className="pef-label">Title</label>
            <input className="pef-input pef-input--title" value={title}
              onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required />
          </div>

          <div className="pef-inline-row">
            <div className="pef-field pef-field--slim">
              <label className="pef-label">Category</label>
              <select className="pef-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="pef-field pef-field--slim">
              <label className="pef-label">Status</label>
              <select className="pef-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="pef-field pef-field--slim">
              <label className="pef-label">Post Type</label>
              <select className="pef-select" value={postType} onChange={(e) => setPostType(e.target.value)}>
                <option value="standard">Standard</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>
          </div>

          {/* Schedule picker — date + 8am/8pm SGT slots */}
          {status === "scheduled" && (
            <div className="pef-field pef-schedule-field">
              <label className="pef-label">
                Publish on
                <span className="pef-label-hint">posts go live at 8am or 8pm SGT</span>
              </label>
              <div className="pef-schedule-row">
                <input
                  type="date"
                  className="pef-input pef-schedule-date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={todaySGT}
                />
                <div className="pef-schedule-slots">
                  {SGT_SLOTS.map((slot, i) => (
                    <button
                      key={slot.label}
                      type="button"
                      className={`pef-slot-btn ${scheduleSlot === i ? "is-active" : ""}`}
                      onClick={() => setScheduleSlot(i)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
              {scheduleDate && (
                <div className="pef-schedule-summary">
                  Will publish on {new Date(buildScheduledAt(scheduleDate, scheduleSlot))
                    .toLocaleString("en-SG", {
                      timeZone: "Asia/Singapore",
                      weekday: "short", day: "numeric", month: "short",
                      year: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pef-slug-row">
          <span className="pef-slug-prefix">slug /</span>
          <input className="pef-slug-input" value={slug}
            onChange={(e) => { slugManuallyEdited.current = true; setSlug(e.target.value); }}
            placeholder="auto-generated" />
        </div>

        <div className="pef-field">
          <label className="pef-label">Excerpt</label>
          <textarea className="pef-textarea" value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)} rows={2}
            placeholder="One or two sentences that describe this post" />
        </div>

        <div className="pef-field">
          <label className="pef-label">
            Body
            <span className="pef-label-hint">write long-form above · add images between blocks</span>
          </label>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <Section label="Hero image">
          <div className="pef-field">
            <div className="pef-image-row">
              <input className="pef-input" value={hero} onChange={(e) => setHero(e.target.value)} placeholder="URL" />
              <button type="button" className="pef-btn-ghost" onClick={() => setMediaTarget("hero")}>Choose</button>
              {hero && <button type="button" className="pef-btn-ghost pef-btn-ghost--muted" onClick={() => setHero("")}>Clear</button>}
            </div>
            {hero && <img src={hero} alt="" className="pef-image-preview" />}
            <input className="pef-input pef-input--caption" value={heroCaption}
              onChange={(e) => setHeroCaption(e.target.value)}
              placeholder="Caption — overlays inside hero image" />
          </div>
        </Section>

        <Section label="Gallery (gallery post type only)">
          <div className="pef-field">
            <label className="pef-label">Gallery Images <span className="pef-label-hint">comma separated URLs</span></label>
            <textarea className="pef-textarea" value={galleryImages}
              onChange={(e) => setGalleryImages(e.target.value)} rows={3} placeholder="url1, url2, url3" />
          </div>
          <div className="pef-field">
            <label className="pef-label">Gallery Captions <span className="pef-label-hint">one per line</span></label>
            <textarea className="pef-textarea" value={galleryCaptions}
              onChange={(e) => setGalleryCaptions(e.target.value)} rows={3}
              placeholder={"Caption 1\nCaption 2\nCaption 3"} />
          </div>
        </Section>

        <Section label="Metadata">
          <div className="pef-meta-grid">
            <div className="pef-field">
              <label className="pef-label">Tags <span className="pef-label-hint">comma separated</span></label>
              <input className="pef-input" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="pef-field">
              <label className="pef-label">Read Time</label>
              <input className="pef-input" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 8 min" />
            </div>
            <div className="pef-field">
              <label className="pef-label">Series / Collection</label>
              <input className="pef-input" value={series} onChange={(e) => setSeries(e.target.value)} />
            </div>
            <div className="pef-field">
              <label className="pef-label">Location</label>
              <input className="pef-input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="pef-field">
              <label className="pef-label">Gear</label>
              <input className="pef-input" value={gear} onChange={(e) => setGear(e.target.value)} />
            </div>
            <div className="pef-field">
              <label className="pef-label">Camera</label>
              <input className="pef-input" value={camera} onChange={(e) => setCamera(e.target.value)} />
            </div>
          </div>
          <div className="pef-field">
            <label className="pef-label">Dive Log / Field Note</label>
            <textarea className="pef-textarea" rows={3} value={diveLog} onChange={(e) => setDiveLog(e.target.value)} />
          </div>
        </Section>

        <Section label="Homepage placement">
          <div className="pef-flags-row">
            <label className="pef-check-label">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured post
            </label>
            <label className="pef-check-label">
              <input type="checkbox" checked={editorsPick} onChange={(e) => setEditorsPick(e.target.checked)} />
              Editor's Pick
            </label>
            {editorsPick && (
              <div className="pef-field pef-field--slim">
                <label className="pef-label">Pick order</label>
                <input type="number" min="1" className="pef-input" value={editorsPickOrder}
                  onChange={(e) => setEditorsPickOrder(e.target.value)} placeholder="1" style={{ width: 72 }} />
              </div>
            )}
          </div>
        </Section>

        <div className="pef-save-bar">
          <button type="submit" className="pef-btn-save" disabled={submitting}>{saveLabel}</button>
          {isDirty && <span className="pef-save-hint">Unsaved changes</span>}
        </div>
      </form>

      {mediaTarget && (
        <div className="pef-modal-overlay" onClick={() => setMediaTarget(null)}>
          <div className="pef-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pef-modal-head">
              <h3>Select image</h3>
              <button type="button" onClick={() => setMediaTarget(null)}>Close</button>
            </div>
            <MediaLibrary key={mediaTarget} onSelect={(url) => {
              if (mediaTarget === "hero") setHero(url);
              if (mediaTarget === "inline") setInline(url);
              setMediaTarget(null);
            }} />
          </div>
        </div>
      )}
    </>
  );
}