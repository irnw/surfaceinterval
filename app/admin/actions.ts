"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../lib/supabase-admin";

function toArray(text: string) {
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

function toTags(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function toImageArray(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCaptionArray(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEditorsPickOrder(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;

  return parsed;
}

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

export async function createPost(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("featured") === "true";
  const isEditorsPick = formData.get("editorsPick") === "true";
  const editorsPickOrder = isEditorsPick
    ? parseEditorsPickOrder(formData.get("editorsPickOrder"))
    : null;

  if (isFeatured) {
    await supabaseAdmin.from("posts").update({ is_featured: false }).neq("id", 0);
  }

  const payload = {
    title: String(formData.get("title") || ""),
    slug,
    category: String(formData.get("category") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: toArray(String(formData.get("body") || "")),
    hero_image: textOrNull(formData.get("hero")),
    hero_image_caption: textOrNull(formData.get("heroCaption")),
    inline_image: textOrNull(formData.get("inline")),
    inline_image_caption: textOrNull(formData.get("inlineCaption")),
    gallery_images: toImageArray(String(formData.get("galleryImages") || "")),
    gallery_captions: toCaptionArray(String(formData.get("galleryCaptions") || "")),
    post_type: String(formData.get("postType") || "standard"),
    read_time: String(formData.get("readTime") || ""),
    status,
    tags: toTags(String(formData.get("tags") || "")),
    is_featured: isFeatured,
    is_editors_pick: isEditorsPick,
    editors_pick_order: editorsPickOrder,
    series: textOrNull(formData.get("series")),
    location: textOrNull(formData.get("location")),
    gear: textOrNull(formData.get("gear")),
    camera: textOrNull(formData.get("camera")),
    dive_log: textOrNull(formData.get("diveLog")),
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { error } = await supabaseAdmin.from("posts").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin");
  redirect("/admin?created=1");
}

export async function updatePost(id: number, formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("featured") === "true";
  const isEditorsPick = formData.get("editorsPick") === "true";
  const editorsPickOrder = isEditorsPick
    ? parseEditorsPickOrder(formData.get("editorsPickOrder"))
    : null;

  if (isFeatured) {
    await supabaseAdmin.from("posts").update({ is_featured: false }).neq("id", id);
  }

  const payload = {
    title: String(formData.get("title") || ""),
    slug,
    category: String(formData.get("category") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    body: toArray(String(formData.get("body") || "")),
    hero_image: textOrNull(formData.get("hero")),
    hero_image_caption: textOrNull(formData.get("heroCaption")),
    inline_image: textOrNull(formData.get("inline")),
    inline_image_caption: textOrNull(formData.get("inlineCaption")),
    gallery_images: toImageArray(String(formData.get("galleryImages") || "")),
    gallery_captions: toCaptionArray(String(formData.get("galleryCaptions") || "")),
    post_type: String(formData.get("postType") || "standard"),
    read_time: String(formData.get("readTime") || ""),
    status,
    tags: toTags(String(formData.get("tags") || "")),
    is_featured: isFeatured,
    is_editors_pick: isEditorsPick,
    editors_pick_order: editorsPickOrder,
    series: textOrNull(formData.get("series")),
    location: textOrNull(formData.get("location")),
    gear: textOrNull(formData.get("gear")),
    camera: textOrNull(formData.get("camera")),
    dive_log: textOrNull(formData.get("diveLog")),
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("posts").update(payload).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin");
  revalidatePath(`/posts/${slug}`);
  redirect("/admin?saved=1");
}

export async function quickUpdatePost(id: number, formData: FormData) {
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("featured") === "on";
  const isEditorsPick = formData.get("editorsPick") === "on";
  const editorsPickOrder = isEditorsPick
    ? parseEditorsPickOrder(formData.get("editorsPickOrder"))
    : null;

  if (isFeatured) {
    await supabaseAdmin.from("posts").update({ is_featured: false }).neq("id", id);
  }

  const payload = {
    status,
    is_featured: isFeatured,
    is_editors_pick: isEditorsPick,
    editors_pick_order: editorsPickOrder,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("posts").update(payload).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createDashboardUser(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function deletePost(id: number) {
  const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

export async function duplicatePost(id: number) {
  const { data: original, error: fetchError } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    throw new Error(fetchError?.message || "Post not found");
  }

  const newSlug = `${original.slug}-copy-${Date.now()}`;

  const payload = {
    ...original,
    id: undefined,
    slug: newSlug,
    title: `${original.title} (Copy)`,
    status: "draft",
    is_featured: false,
    is_editors_pick: false,
    editors_pick_order: null,
    published_at: null,
    created_at: undefined,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("posts").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?duplicated=1");
}