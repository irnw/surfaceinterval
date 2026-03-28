"use client";

import { useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadMediaFile } from "../lib/media-upload";

interface ImageCropperProps {
  src: string;
  file?: File;
  onComplete: (url: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  mimeType: string = "image/jpeg"
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, canvas.width, canvas.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      mimeType, 0.92
    );
  });
}

const ASPECT_PRESETS = [
  { label: "Free",    value: undefined },
  { label: "16 : 9", value: 16 / 9 },
  { label: "4 : 3",  value: 4 / 3 },
  { label: "1 : 1",  value: 1 },
  { label: "3 : 4",  value: 3 / 4 },
  { label: "2 : 3",  value: 2 / 3 },
];

export default function ImageCropper({ src, file, onComplete, onCancel, aspectRatio }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(w, h, aspect));
    } else {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    }
  }

  function handleAspectChange(newAspect: number | undefined) {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { naturalWidth: w, naturalHeight: h } = imgRef.current;
      setCrop(centerAspectCrop(w, h, newAspect));
    }
  }

  async function handleApply() {
    if (!completedCrop || !imgRef.current) {
      onComplete(src);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const mimeType = file?.type ?? "image/jpeg";
      const blob = await getCroppedBlob(imgRef.current, completedCrop, mimeType);
      const croppedFile = new File(
        [blob],
        file?.name ?? `cropped-${Date.now()}.jpg`,
        { type: mimeType }
      );
      const url = await uploadMediaFile(croppedFile);
      onComplete(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="cropper-overlay" onClick={onCancel}>
      <div className="cropper-card" onClick={(e) => e.stopPropagation()}>
        <div className="cropper-head">
          <span className="cropper-title">Crop image</span>
          <button type="button" className="cropper-close" onClick={onCancel}>✕</button>
        </div>

        <div className="cropper-presets">
          {ASPECT_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={`cropper-preset-btn ${aspect === p.value ? "is-active" : ""}`}
              onClick={() => handleAspectChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="cropper-canvas">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            {/* ✅ crossOrigin="anonymous" fixes "tainted canvas" CORS error */}
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              crossOrigin="anonymous"
              onLoad={onImageLoad}
              style={{ maxHeight: "60vh", maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>

        {error && <p className="cropper-error">{error}</p>}

        <div className="cropper-actions">
          <button type="button" className="pef-btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="pef-btn-save" onClick={handleApply} disabled={uploading}>
            {uploading ? "Uploading…" : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}