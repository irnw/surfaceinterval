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

/**
 * Convert a UTC ISO string to a datetime-local string in the user's local timezone.
 * Used to pre-fill the schedule input when editing an existing scheduled post.
 */
function utcToLocalDatetimeLocal(utcIso: string): string {
  if (!utcIso) return "";
  const d = new Date(utcIso);
  // Offset the date by timezone difference to get local time
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
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
  // ✅ Convert stored UTC back to local time for display
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt ? utcToLocalDatetimeLocal(initial.scheduledAt) : ""
  );
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "scheduled" && !scheduledAt) {
      alert("Please set a publish date and time before scheduling.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.set("title", title); fd.set("slug", slug); fd.set("category", category);
    fd.set("excerpt", excerpt); fd.set("body", JSON.stringify(blocks));
    fd.set("hero", hero); fd.set("heroCaption", heroCaption);
    fd.set("inline", inline); fd.set("inlineCaption", inlineCaption);
    fd.set("galleryImages", galleryImages); fd.set("galleryCaptions", galleryCaptions);
    fd.set("postType", postType); fd.set("readTime", readTime);
    fd.set("status", status); fd.set("scheduledAt", scheduledAt);
    // ✅ Send browser timezone offset so server converts to correct UTC
    fd.set("tzOffset", String(new Date().getTimezoneOffset()));
    fd.set("featured", featured ? "true" : "false");
    fd.set("editorsPick", editorsPick ? "true" : "false");
    fd.set("editorsPickOrder", editorsPickOrder);
    fd.set("existingPublishedAt", initial?.existingPublishedAt || "");
    fd.set("tags", tags); fd.set("series", series); fd.set("location", location);
    fd.set("gear", gear); fd.set("camera", camera); fd.set("diveLog", diveLog);
    await onSubmit(fd);
  }

  const saveLabel = submitting ? "Saving…"
    : status === "scheduled" && scheduledAt ? "Schedule Post"
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

          {status === "scheduled" && (
            <div className="pef-field pef-schedule-field">
              <label className="pef-label">
                Publish at
                <span className="pef-label-hint">
                  your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                </span>
              </label>
              <input
                type="datetime-local"
                className="pef-input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 16)}
              />
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