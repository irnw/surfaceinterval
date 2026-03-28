"use client";

import { useRef, useState } from "react";
import { uploadMediaFile, getFilesFromClipboard } from "../lib/media-upload";

interface PostBodyEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

/**
 * Drop-in replacement for the body <textarea> in the post editor.
 * Paste any image or GIF → it uploads to Supabase Storage and inserts
 * a markdown image tag at the cursor position automatically.
 */
export default function PostBodyEditor({
  value,
  onChange,
  placeholder = "Write your post here…",
}: PostBodyEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = getFilesFromClipboard(e.nativeEvent);
    if (files.length === 0) return; // plain text — fall through normally

    e.preventDefault();
    setUploading(true);

    try {
      for (const file of files) {
        const url = await uploadMediaFile(file);
        insertAtCursor(`\n![](${url})\n`);
      }
    } catch (err) {
      console.error("Paste upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function insertAtCursor(text: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
      el.focus();
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={ref}
        name="body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        style={{ width: "100%", minHeight: "320px", resize: "vertical" }}
      />
      {uploading && (
        <div style={{
          position: "absolute",
          bottom: "12px",
          right: "14px",
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--purple)",
          background: "var(--surface-2)",
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid var(--line)",
        }}>
          Uploading…
        </div>
      )}
    </div>
  );
}