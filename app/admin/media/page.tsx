"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MediaPage() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setUrl("");

    const path = `uploads/${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage.from("site-media").upload(path, file);

    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data } = supabase.storage.from("site-media").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <>
      <div className="panel-head"><h2>Media</h2></div>
      <div className="setting-item">
        <label>Upload Image</label>
        <input type="file" accept="image/*,video/*" onChange={handleUpload} />
      </div>
      {uploading && <p style={{ marginTop: 16 }}>Uploading...</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}
      {url && (
        <div style={{ marginTop: 20 }}>
          <div className="setting-item" style={{ marginBottom: 12 }}>
            <label>Public URL</label>
            <input value={url} readOnly />
          </div>
          <img src={url} alt="Preview" style={{ maxWidth: 360, borderRadius: 16 }} />
        </div>
      )}
    </>
  );
}
