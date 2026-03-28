import { createBrowserClient } from "@supabase/ssr";

// All accepted MIME types — includes .tif/.tiff
export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",     // .tif / .tiff
  "image/avif",
  "video/mp4",
  "video/quicktime",
];

export const ACCEPTED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp",
  ".gif", ".tif", ".tiff", ".avif",
  ".mp4", ".mov",
];

// Use this as the `accept` attribute on file inputs
export const ACCEPTED_ATTR = ACCEPTED_EXTENSIONS.join(",");

/**
 * Upload a File to Supabase Storage → returns the public URL.
 * Used by the media library uploader AND the paste-in-editor handler.
 */
export async function uploadMediaFile(file: File): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const timestamp = Date.now();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const path = `uploads/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract image Files from a native ClipboardEvent.
 * Pass e.nativeEvent when calling from a React onPaste handler.
 */
export function getFilesFromClipboard(e: ClipboardEvent): File[] {
  return Array.from(e.clipboardData?.items ?? [])
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((f): f is File => f !== null);
}