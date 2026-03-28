"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "../lib/supabase-admin";

function toTags(text: string) { return text.split(",").map((t) => t.trim()).filter(Boolean); }
function toImageArray(text: string) { return text.split(",").map((i) => i.trim()).filter(Boolean); }
function toCaptionArray(text: string) { return text.split("\n").map((i) => i.trim()); }
function parseEditorsPickOrder(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}
function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}
function parseBody(raw: FormDataEntryValue | null): unknown[] {
  const str = String(raw || "").trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* fall through */ }
  return str.split("\n").map((p) => p.trim()).filter(Boolean)
    .map((content) => ({ id: Math.random().toString(36).slice(2), type: "text", content }));
}

function buildPostPayload(formData: FormData, options?: { keepPublishedDate?: boolean }) {
  const status = String(formData.get("status") || "draft");
  const keepPublishedDate = options?.keepPublishedDate ?? false;
  const scheduledAtRaw = String(formData.get("scheduledAt") || "").trim();
  const scheduledAt = scheduledAtRaw && status === "scheduled" ? scheduledAtRaw : null;
  const publishedAt =
    status === "published"
      ? keepPublishedDate
        ? textOrNull(formData.get("existingPublishedAt")) || new Date().toISOString()
        : new Date().toISOString()
      : null;
  return {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    body: parseBody(formData.get("body")),
    hero_image: textOrNull(formData.get("hero")),
    hero_image_caption: textOrNull(formData.get("heroCaption")),
    inline_image: textOrNull(formData.get("inline")),
    inline_image_caption: textOrNull(formData.get("inlineCaption")),
    gallery_images: toImageArray(String(formData.get("galleryImages") || "")),
    gallery_captions: toCaptionArray(String(formData.get("galleryCaptions") || "")),
    post_type: String(formData.get("postType") || "standard").trim(),
    read_time: textOrNull(formData.get("readTime")),
    status,
    tags: toTags(String(formData.get("tags") || "")),
    is_featured: formData.get("featured") === "true",
    is_editors_pick: formData.get("editorsPick") === "true",
    editors_pick_order: formData.get("editorsPick") === "true"
      ? parseEditorsPickOrder(formData.get("editorsPickOrder")) : null,
    series: textOrNull(formData.get("series")),
    location: textOrNull(formData.get("location")),
    gear: textOrNull(formData.get("gear")),
    camera: textOrNull(formData.get("camera")),
    dive_log: textOrNull(formData.get("diveLog")),
    published_at: publishedAt,
    scheduled_at: scheduledAt,
  };
}

async function normalizeHomepageFlags(idToKeepFeatured?: number, shouldBeFeatured?: boolean) {
  if (!shouldBeFeatured) return;
  let query = supabaseAdmin.from("posts").update({ is_featured: false });
  query = typeof idToKeepFeatured === "number" ? query.neq("id", idToKeepFeatured) : query.neq("id", 0);
  await query;
}

async function getPrimarySettingsRowId() {
  const { data, error } = await supabaseAdmin.from("settings").select("id")
    .order("id", { ascending: true }).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No settings row found.");
  return data.id as number;
}

export async function createPost(formData: FormData) {
  const payload = buildPostPayload(formData);
  await normalizeHomepageFlags(undefined, payload.is_featured);
  const { error } = await supabaseAdmin.from("posts").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/search"); revalidatePath("/admin");
  redirect("/admin?created=1");
}

export async function updatePost(id: number, formData: FormData) {
  const payload = buildPostPayload(formData, { keepPublishedDate: true });
  await normalizeHomepageFlags(id, payload.is_featured);
  const { error } = await supabaseAdmin.from("posts")
    .update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/search"); revalidatePath("/admin");
  revalidatePath(`/posts/${payload.slug}`);
  redirect("/admin?saved=1");
}

export async function quickUpdatePost(id: number, formData: FormData) {
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("featured") === "on";
  const isEditorsPick = formData.get("editorsPick") === "on";
  const editorsPickOrder = isEditorsPick ? parseEditorsPickOrder(formData.get("editorsPickOrder")) : null;
  const scheduledAtRaw = String(formData.get("scheduledAt") || "").trim();
  const scheduledAt = scheduledAtRaw && status === "scheduled" ? scheduledAtRaw : null;
  await normalizeHomepageFlags(id, isFeatured);
  const { error } = await supabaseAdmin.from("posts").update({
    status, is_featured: isFeatured, is_editors_pick: isEditorsPick,
    editors_pick_order: editorsPickOrder,
    published_at: status === "published" ? new Date().toISOString() : null,
    scheduled_at: scheduledAt, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/search"); revalidatePath("/admin");
}

export async function deletePost(id: number) {
  const { data: existing } = await supabaseAdmin.from("posts").select("slug").eq("id", id).single();
  const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/search"); revalidatePath("/admin");
  if (existing?.slug) revalidatePath(`/posts/${existing.slug}`);
  redirect("/admin?deleted=1");
}

export async function duplicatePost(id: number) {
  const { data: original, error: fetchError } = await supabaseAdmin.from("posts").select("*").eq("id", id).single();
  if (fetchError || !original) throw new Error(fetchError?.message || "Post not found");
  const { error } = await supabaseAdmin.from("posts").insert({
    ...original, id: undefined,
    slug: `${original.slug}-copy-${Date.now()}`,
    title: `${original.title} (Copy)`,
    status: "draft", is_featured: false, is_editors_pick: false,
    editors_pick_order: null, published_at: null, scheduled_at: null,
    created_at: undefined, updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/archive"); revalidatePath("/search"); revalidatePath("/admin");
  redirect("/admin?duplicated=1");
}

export async function createDashboardUser(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  if (!email || !password) throw new Error("Email and password are required.");
  const { error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function saveSiteSettings(formData: FormData) {
  // Hero slides
  let heroSlides: Array<{ image: string; caption: string }> = [];
  try {
    const parsed = JSON.parse(String(formData.get("heroSlidesPayload") || "[]"));
    if (Array.isArray(parsed)) {
      heroSlides = parsed
        .filter((item) => item && typeof item.image === "string" && item.image.trim().length > 0)
        .slice(0, 5)
        .map((item) => ({ image: String(item.image || "").trim(), caption: String(item.caption || "").trim() }));
    }
  } catch { heroSlides = []; }

  // Reading shelf
  let readingShelf: Array<{ title: string; author: string; note: string }> = [];
  try {
    const parsed = JSON.parse(String(formData.get("readingShelfPayload") || "[]"));
    if (Array.isArray(parsed)) {
      readingShelf = parsed
        .filter((b) => b?.title?.trim())
        .slice(0, 6)
        .map((b) => ({
          title: String(b.title || "").trim(),
          author: String(b.author || "").trim(),
          note: String(b.note || "").trim(),
        }));
    }
  } catch { readingShelf = []; }

  const settingsId = await getPrimarySettingsRowId();
  const { error } = await supabaseAdmin.from("settings").update({
    hero_slides: heroSlides,
    about_photo: String(formData.get("about_photo") || "").trim() || null,
    about_title: String(formData.get("about_title") || "").trim(),
    about_intro: String(formData.get("about_intro") || "").trim(),
    about_body: String(formData.get("about_body") || "").trim(),
    collaboration_note: String(formData.get("collaboration_note") || "").trim(),
    contact_title: String(formData.get("contact_title") || "").trim(),
    contact_intro: String(formData.get("contact_intro") || "").trim(),
    contact_email: String(formData.get("contact_email") || "").trim(),
    contact_body: String(formData.get("contact_body") || "").trim(),
    dives_logged: String(formData.get("dives_logged") || "").trim(),
    countries_reached: String(formData.get("countries_reached") || "").trim(),
    reading_shelf: readingShelf,
    updated_at: new Date().toISOString(),
  }).eq("id", settingsId);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/about"); revalidatePath("/contact"); revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function publishScheduledPosts() {
  const now = new Date().toISOString();
  const { data: due, error: fetchError } = await supabaseAdmin
    .from("posts").select("id, slug").eq("status", "scheduled").lte("scheduled_at", now);
  if (fetchError) throw new Error(fetchError.message);
  if (!due || due.length === 0) return { published: 0 };
  const ids = due.map((p) => p.id);
  const { error: updateError } = await supabaseAdmin.from("posts")
    .update({ status: "published", published_at: now, scheduled_at: null, updated_at: now })
    .in("id", ids);
  if (updateError) throw new Error(updateError.message);
  revalidatePath("/"); revalidatePath("/archive");
  for (const post of due) revalidatePath(`/posts/${post.slug}`);
  return { published: due.length };
}