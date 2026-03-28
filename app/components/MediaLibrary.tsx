"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type MediaLibraryProps = {
  onSelect?: (url: string) => void;
  selectable?: boolean;
};

type FileItem = {
  name: string;
  path: string;
  publicUrl: string;
  isVideo: boolean;
};

const VIDEO_EXTS = ["mp4", "mov", "webm", "m4v"];
const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/tiff,image/avif,video/mp4,video/quicktime,video/webm,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff,.avif,.mp4,.mov,.webm";

function isVideoFile(name: string) {
  return VIDEO_EXTS.includes(name.split(".").pop()?.toLowerCase() ?? "");
}

export default function MediaLibrary({ onSelect, selectable = true }: MediaLibraryProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    setError("");
    const { data, error } = await supabase.storage
      .from("media")
      .list("uploads", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (error) { setError(error.message); return; }

    const mapped = (data ?? []).map((file) => {
      const path = `uploads/${file.name}`;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      return { name: file.name, path, publicUrl: pub.publicUrl, isVideo: isVideoFile(file.name) };
    });
    setFiles(mapped);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
      const filePath = `uploads/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  }

  async function handleDelete(item: FileItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(item.path);
    const { error } = await supabase.storage.from("media").remove([item.path]);
    if (error) { setError(error.message); setDeleting(null); return; }
    setFiles((prev) => prev.filter((f) => f.path !== item.path));
    setSelected((prev) => { const n = new Set(prev); n.delete(item.path); return n; });
    setDeleting(null);
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} file(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    const paths = Array.from(selected);
    const { error } = await supabase.storage.from("media").remove(paths);
    if (error) { setError(error.message); setBulkDeleting(false); return; }
    setFiles((prev) => prev.filter((f) => !selected.has(f.path)));
    setSelected(new Set());
    setBulkDeleting(false);
  }

  function handleBulkDownload() {
    const selectedFiles = files.filter((f) => selected.has(f.path));
    for (const file of selectedFiles) {
      const a = document.createElement("a");
      a.href = file.publicUrl;
      a.download = file.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 1800);
  }

  function toggleSelect(path: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(path)) n.delete(path); else n.add(path);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === files.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(files.map((f) => f.path)));
    }
  }

  return (
    <div className="ml-root">
      {/* Upload dropzone */}
      <div
        className={`ml-dropzone ${dragging ? "ml-dropzone--over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) await uploadFile(f); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept={ACCEPTED} onChange={handleFileInput} style={{ display: "none" }} />
        <div className="ml-dropzone-inner">
          {uploading ? <span className="ml-uploading">Uploading…</span> : (
            <>
              <span className="ml-dropzone-icon">↑</span>
              <span className="ml-dropzone-text">Click to upload or drag a file here</span>
              <span className="ml-dropzone-hint">JPEG · PNG · WebP · GIF · TIFF · AVIF · MP4 · MOV</span>
            </>
          )}
        </div>
      </div>

      {error && <p className="ml-error">{error}</p>}

      {/* Bulk action bar */}
      {files.length > 0 && (
        <div className="ml-bulk-bar">
          <label className="ml-select-all">
            <input
              type="checkbox"
              checked={selected.size === files.length && files.length > 0}
              onChange={toggleSelectAll}
            />
            <span>{selected.size > 0 ? `${selected.size} selected` : "Select all"}</span>
          </label>

          {selected.size > 0 && (
            <div className="ml-bulk-actions">
              <button
                type="button"
                className="ml-bulk-btn"
                onClick={handleBulkDownload}
                title="Download selected"
              >
                Download ({selected.size})
              </button>
              <button
                type="button"
                className="ml-bulk-btn ml-bulk-btn--danger"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                title="Delete selected"
              >
                {bulkDeleting ? "Deleting…" : `Delete (${selected.size})`}
              </button>
            </div>
          )}
        </div>
      )}

      {files.length === 0 && !uploading ? (
        <p className="ml-empty">No media yet. Upload your first file above.</p>
      ) : (
        <div className="ml-grid">
          {files.map((item) => (
            <div
              key={item.path}
              className={`ml-card ${selected.has(item.path) ? "ml-card--selected" : ""}`}
            >
              {/* Checkbox */}
              <div className="ml-card-check">
                <input
                  type="checkbox"
                  checked={selected.has(item.path)}
                  onChange={() => toggleSelect(item.path)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Thumbnail */}
              <div
                className="ml-thumb"
                onClick={() => {
                  if (selectable && onSelect) onSelect(item.publicUrl);
                  else handleCopy(item.publicUrl);
                }}
                title={selectable ? "Select" : "Copy URL"}
              >
                {item.isVideo ? (
                  <video src={item.publicUrl} className="ml-media" muted playsInline preload="metadata" />
                ) : (
                  <img src={item.publicUrl} alt={item.name} className="ml-media" loading="lazy" />
                )}
                {item.isVideo && <div className="ml-video-badge">▶ Video</div>}
                {copied === item.publicUrl && <div className="ml-copied-toast">Copied!</div>}
              </div>

              {/* Footer */}
              <div className="ml-card-footer">
                <span className="ml-filename" title={item.name}>{item.name.slice(0, 18)}</span>
                <div className="ml-card-actions">
                  <button type="button" className="ml-action-btn" onClick={() => handleCopy(item.publicUrl)}>
                    {copied === item.publicUrl ? "✓" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="ml-action-btn ml-action-btn--danger"
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.path}
                  >
                    {deleting === item.path ? "…" : "Del"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}