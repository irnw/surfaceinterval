"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaLibrary from "./MediaLibrary";
import PostBodyEditor from "./PostBodyEditor";

type Props = {
  initial?: {
    title?: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    body?: string;
    hero?: string;
    heroCaption?: string;
    inline?: string;
    inlineCaption?: string;
    galleryImages?: string[];
    galleryCaptions?: string[];
    postType?: string;
    readTime?: string;
    status?: string;
    featured?: boolean;
    editorsPick?: boolean;
    editorsPickOrder?: number | null;
    existingPublishedAt?: string;
    tags?: string[];
    series?: string;
    location?: string;
    gear?: string;
    camera?: string;
    diveLog?: string;
  };
  onSubmit: (formData: FormData) => void | Promise<void>;
};

const categories = ["Diving", "Travel", "Gear", "Personal"];

function Section({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pef-section">
      <button
        type="button"
        className="pef-section-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
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
  const [galleryImages, setGalleryImages] = useState(
    initial?.galleryImages?.join(", ") || ""
  );
  const [galleryCaptions, setGalleryCaptions] = useState(
    initial?.galleryCaptions?.join("\n") || ""
  );
  const [postType, setPostType] = useState(initial?.postType || "standard");
  const [category, setCategory] = useState(initial?.category || "Diving");
  const [readTime, setReadTime] = useState(initial?.readTime || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [editorsPick, setEditorsPick] = useState(initial?.editorsPick || false);
  const [editorsPickOrder, setEditorsPickOrder] = useState(
    initial?.editorsPickOrder != null ? String(initial.editorsPickOrder) : ""
  );
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [body, setBody] = useState(initial?.body || "");
  const [series, setSeries] = useState(initial?.series || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [gear, setGear] = useState(initial?.gear || "");
  const [camera, setCamera] = useState(initial?.camera || "");
  const [diveLog, setDiveLog] = useState(initial?.diveLog || "");
  const [mediaTarget, setMediaTarget] = useState<"hero" | "inline" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        title: initial?.title || "",
        slug: initial?.slug || "",
        hero: initial?.hero || "",
        heroCaption: initial?.heroCaption || "",
        inline: initial?.inline || "",
        inlineCaption: initial?.inlineCaption || "",
        galleryImages: initial?.galleryImages?.join(", ") || "",
        galleryCaptions: initial?.galleryCaptions?.join("\n") || "",
        postType: initial?.postType || "standard",
        category: initial?.category || "Diving",
        readTime: initial?.readTime || "",
        status: initial?.status || "draft",
        featured: initial?.featured || false,
        editorsPick: initial?.editorsPick || false,
        editorsPickOrder:
          initial?.editorsPickOrder != null ? String(initial.editorsPickOrder) : "",
        tags: initial?.tags?.join(", ") || "",
        excerpt: initial?.excerpt || "",
        body: initial?.body || "",
        series: initial?.series || "",
        location: initial?.location || "",
        gear: initial?.gear || "",
        camera: initial?.camera || "",
        diveLog: initial?.diveLog || "",
      }),
    [initial]
  );

  const currentSnapshot = JSON.stringify({
    title, slug, hero, heroCaption, inline, inlineCaption,
    galleryImages, galleryCaptions, postType, category, readTime,
    status, featured, editorsPick, editorsPickOrder, tags, excerpt,
    body, series, location, gear, camera, diveLog,
  });

  const isDirty = initialSnapshot !== currentSnapshot;

  useEffect(() => {
    if (!initial?.slug) {
      setSlug(
        title.toLowerCase().trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      );
    }
  }, [title, initial?.slug]);

  useEffect(() => {
    if (!editorsPick) setEditorsPickOrder("");
  }, [editorsPick]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty || submitting) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, submitting]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("category", category);
    formData.set("excerpt", excerpt);
    formData.set("body", body);
    formData.set("hero", hero);
    formData.set("heroCaption", heroCaption);
    formData.set("inline", inline);
    formData.set("inlineCaption", inlineCaption);
    formData.set("galleryImages", galleryImages);
    formData.set("galleryCaptions", galleryCaptions);
    formData.set("postType", postType);
    formData.set("readTime", readTime);
    formData.set("status", status);
    formData.set("featured", featured ? "true" : "false");
    formData.set("editorsPick", editorsPick ? "true" : "false");
    formData.set("editorsPickOrder", editorsPickOrder);
    formData.set("existingPublishedAt", initial?.existingPublishedAt || "");
    formData.set("tags", tags);
    formData.set("series", series);
    formData.set("location", location);
    formData.set("gear", gear);
    formData.set("camera", camera);
    formData.set("diveLog", diveLog);
    await onSubmit(formData);
  }

  return (
    <>
      {isDirty && (
        <div className="pef-dirty-bar">Unsaved changes</div>
      )}

      <form onSubmit={handleSubmit} className="pef-form">

        {/* ── TOP BAR: the fields you always need ── */}
        <div className="pef-topbar">
          <div className="pef-field pef-field--title">
            <label className="pef-label">Title</label>
            <input
              className="pef-input pef-input--title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
            />
          </div>

          <div className="pef-inline-row">
            <div className="pef-field pef-field--slim">
              <label className="pef-label">Category</label>
              <select
                className="pef-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="pef-field pef-field--slim">
              <label className="pef-label">Status</label>
              <select
                className="pef-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="pef-field pef-field--slim">
              <label className="pef-label">Post Type</label>
              <select
                className="pef-select"
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── SLUG (auto-generated, shown small) ── */}
        <div className="pef-slug-row">
          <span className="pef-slug-prefix">slug /</span>
          <input
            className="pef-slug-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated"
          />
        </div>

        {/* ── EXCERPT ── */}
        <div className="pef-field">
          <label className="pef-label">Excerpt</label>
          <textarea
            className="pef-textarea"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="One or two sentences that describe this post"
          />
        </div>

        {/* ── BODY — paste images/GIFs directly ── */}
        <div className="pef-field">
          <label className="pef-label">
            Body
            <span className="pef-label-hint">one paragraph per line · paste images directly</span>
          </label>
          <PostBodyEditor
            value={body}
            onChange={setBody}
            placeholder="Write here. Paste images or GIFs directly into this field."
          />
        </div>

        {/* ── IMAGES — collapsible ── */}
        <Section label="Images">
          <div className="pef-field">
            <label className="pef-label">Hero Image</label>
            <div className="pef-image-row">
              <input
                className="pef-input"
                value={hero}
                onChange={(e) => setHero(e.target.value)}
                placeholder="URL"
              />
              <button type="button" className="pef-btn-ghost" onClick={() => setMediaTarget("hero")}>
                Choose
              </button>
              {hero && (
                <button type="button" className="pef-btn-ghost pef-btn-ghost--muted" onClick={() => setHero("")}>
                  Clear
                </button>
              )}
            </div>
            {hero && (
              <img src={hero} alt="" className="pef-image-preview" />
            )}
            <input
              className="pef-input pef-input--caption"
              value={heroCaption}
              onChange={(e) => setHeroCaption(e.target.value)}
              placeholder="Caption — e.g. Addu Atoll, Maldives · March 2026"
            />
          </div>

          <div className="pef-field">
            <label className="pef-label">Inline Image</label>
            <div className="pef-image-row">
              <input
                className="pef-input"
                value={inline}
                onChange={(e) => setInline(e.target.value)}
                placeholder="URL"
              />
              <button type="button" className="pef-btn-ghost" onClick={() => setMediaTarget("inline")}>
                Choose
              </button>
              {inline && (
                <button type="button" className="pef-btn-ghost pef-btn-ghost--muted" onClick={() => setInline("")}>
                  Clear
                </button>
              )}
            </div>
            {inline && (
              <img src={inline} alt="" className="pef-image-preview" />
            )}
            <input
              className="pef-input pef-input--caption"
              value={inlineCaption}
              onChange={(e) => setInlineCaption(e.target.value)}
              placeholder="Optional caption"
            />
          </div>

          <div className="pef-field">
            <label className="pef-label">Gallery Images <span className="pef-label-hint">comma separated URLs</span></label>
            <textarea
              className="pef-textarea"
              value={galleryImages}
              onChange={(e) => setGalleryImages(e.target.value)}
              rows={3}
              placeholder="url1, url2, url3"
            />
          </div>

          <div className="pef-field">
            <label className="pef-label">Gallery Captions <span className="pef-label-hint">one per line, matching order</span></label>
            <textarea
              className="pef-textarea"
              value={galleryCaptions}
              onChange={(e) => setGalleryCaptions(e.target.value)}
              rows={3}
              placeholder={"Caption 1\nCaption 2\nCaption 3"}
            />
          </div>
        </Section>

        {/* ── METADATA — collapsible ── */}
        <Section label="Metadata">
          <div className="pef-meta-grid">
            <div className="pef-field">
              <label className="pef-label">Tags <span className="pef-label-hint">comma separated</span></label>
              <input className="pef-input" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="pef-field">
              <label className="pef-label">Read Time <span className="pef-label-hint">optional override</span></label>
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

        {/* ── HOMEPAGE FLAGS — collapsible ── */}
        <Section label="Homepage placement">
          <div className="pef-flags-row">
            <label className="pef-check-label">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured post
            </label>

            <label className="pef-check-label">
              <input
                type="checkbox"
                checked={editorsPick}
                onChange={(e) => setEditorsPick(e.target.checked)}
              />
              Editor's Pick
            </label>

            {editorsPick && (
              <div className="pef-field pef-field--slim">
                <label className="pef-label">Pick order</label>
                <input
                  type="number"
                  min="1"
                  className="pef-input"
                  value={editorsPickOrder}
                  onChange={(e) => setEditorsPickOrder(e.target.value)}
                  placeholder="1"
                  style={{ width: 72 }}
                />
              </div>
            )}
          </div>
        </Section>

        {/* ── SAVE BAR ── */}
        <div className="pef-save-bar">
          <button type="submit" className="pef-btn-save" disabled={submitting}>
            {submitting ? "Saving…" : "Save Post"}
          </button>
          {isDirty && <span className="pef-save-hint">Unsaved changes</span>}
        </div>
      </form>

      {/* ── MEDIA PICKER MODAL ── */}
      {mediaTarget && (
        <div
          className="pef-modal-overlay"
          onClick={() => setMediaTarget(null)}
        >
          <div
            className="pef-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
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