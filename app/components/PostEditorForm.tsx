"use client";

import { useEffect, useMemo, useState } from "react";
import MediaLibrary from "./MediaLibrary";

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
    title,
    slug,
    hero,
    heroCaption,
    inline,
    inlineCaption,
    galleryImages,
    galleryCaptions,
    postType,
    category,
    readTime,
    status,
    featured,
    editorsPick,
    editorsPickOrder,
    tags,
    excerpt,
    body,
    series,
    location,
    gear,
    camera,
    diveLog,
  });

  const isDirty = initialSnapshot !== currentSnapshot;

  useEffect(() => {
    if (!initial?.slug) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setSlug(generated);
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
    formData.set("tags", tags);
    formData.set("series", series);
    formData.set("location", location);
    formData.set("gear", gear);
    formData.set("camera", camera);
    formData.set("diveLog", diveLog);

    await onSubmit(formData);
  }

  function openMediaPicker(target: "hero" | "inline") {
    setMediaTarget(target);
  }

  function handleMediaSelect(url: string) {
    if (mediaTarget === "hero") setHero(url);
    if (mediaTarget === "inline") setInline(url);
    setMediaTarget(null);
  }

  return (
    <>
      {isDirty ? <div className="editor-warning">You have unsaved changes.</div> : null}

      <form onSubmit={handleSubmit} className="settings-grid">
        <div className="setting-item">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <label>Post Type</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)}>
            <option value="standard">Standard</option>
            <option value="gallery">Gallery</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Read Time</label>
          <input
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            placeholder="Optional manual override"
          />
        </div>

        <div className="setting-item">
          <label>Series / Collection</label>
          <input value={series} onChange={(e) => setSeries(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Gear</label>
          <input value={gear} onChange={(e) => setGear(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Camera</label>
          <input value={camera} onChange={(e) => setCamera(e.target.value)} />
        </div>

        <div className="setting-item is-full">
          <label>Dive Log / Field Note</label>
          <textarea rows={3} value={diveLog} onChange={(e) => setDiveLog(e.target.value)} />
        </div>

        <div className="setting-item">
          <label>Featured</label>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        </div>

        <div className="setting-item">
          <label>Editor&apos;s Pick</label>
          <input type="checkbox" checked={editorsPick} onChange={(e) => setEditorsPick(e.target.checked)} />
        </div>

        <div className="setting-item">
          <label>Editor&apos;s Pick Order</label>
          <input
            type="number"
            min="1"
            value={editorsPickOrder}
            onChange={(e) => setEditorsPickOrder(e.target.value)}
            disabled={!editorsPick}
          />
        </div>

        <div className="setting-item">
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        <div className="setting-item is-full">
          <label>Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
        </div>

        <div className="setting-item is-full">
          <label>Body (one paragraph per line)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
        </div>

        <div className="setting-item is-full">
          <label>Hero Image URL</label>
          <input value={hero} onChange={(e) => setHero(e.target.value)} />
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => openMediaPicker("hero")}>
              Select Hero Image
            </button>
            {hero ? (
              <button type="button" onClick={() => setHero("")}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="setting-item is-full">
          <label>Hero Image Caption</label>
          <input
            value={heroCaption}
            onChange={(e) => setHeroCaption(e.target.value)}
            placeholder="e.g. Addu Atoll, Maldives · March 2026"
          />
        </div>

        <div className="setting-item is-full">
          <label>Inline Image URL</label>
          <input value={inline} onChange={(e) => setInline(e.target.value)} />
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => openMediaPicker("inline")}>
              Select Inline Image
            </button>
            {inline ? (
              <button type="button" onClick={() => setInline("")}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="setting-item is-full">
          <label>Inline Image Caption</label>
          <input
            value={inlineCaption}
            onChange={(e) => setInlineCaption(e.target.value)}
            placeholder="Optional caption for the inline image"
          />
        </div>

        <div className="setting-item is-full">
          <label>Gallery Images (comma separated URLs)</label>
          <textarea
            value={galleryImages}
            onChange={(e) => setGalleryImages(e.target.value)}
            rows={4}
            placeholder="url1, url2, url3"
          />
        </div>

        <div className="setting-item is-full">
          <label>Gallery Captions (one per line, matching image order)</label>
          <textarea
            value={galleryCaptions}
            onChange={(e) => setGalleryCaptions(e.target.value)}
            rows={4}
            placeholder={"Caption 1\nCaption 2\nCaption 3"}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Post"}
          </button>
        </div>
      </form>

      {mediaTarget ? (
        <div
          onClick={() => setMediaTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>Select image</h3>
              <button type="button" onClick={() => setMediaTarget(null)}>
                Close
              </button>
            </div>

            <MediaLibrary key={mediaTarget} onSelect={handleMediaSelect} />
          </div>
        </div>
      ) : null}
    </>
  );
}