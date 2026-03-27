"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type MediaLibraryProps = {
  onSelect: (url: string) => void;
};

type FileItem = {
  name: string;
  publicUrl: string;
};

export default function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setError("");

    const { data, error } = await supabase.storage
      .from("media") // ✅ FIXED
      .list("uploads", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      setError(error.message);
      return;
    }

    const mapped =
      data?.map((file) => {
        const path = `uploads/${file.name}`;

        const { data: publicData } = supabase.storage
          .from("media") // ✅ FIXED
          .getPublicUrl(path);

        return {
          name: file.name,
          publicUrl: publicData.publicUrl,
        };
      }) || [];

    setFiles(mapped);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setUrl("");

    try {
      const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
             .from("media")
                .upload(filePath, file, {
                    cacheControl: "3600",
                upsert: false, 
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from("media")
          .getPublicUrl(filePath);

        const url = publicUrlData.publicUrl;

      await loadFiles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" onChange={handleUpload} />

      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {url && <p>Uploaded: {url}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {files.map((file) => (
          <button
            key={file.publicUrl}
            type="button"
            onClick={() => onSelect(file.publicUrl)}
          >
            <img
              src={file.publicUrl}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}