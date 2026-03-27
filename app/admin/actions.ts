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
    .map((item) => item.trim());
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

function buildPostPayload(formData: FormData, options?: { keepPublishedDate?: boolean }) {
  const status = String(formData.get("status") || "draft");
  const keepPublishedDate = options?.keepPublishedDate ?? false;

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
    body: toArray(String(formData.get("body") || "")),
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
    editors_pick_order:
      formData.get("editorsPick") === "true"
        ? parseEditorsPickOrder(formData.get("editorsPickOrder"))
        : null,
    series: textOrNull(formData.get("series")),
    location: textOrNull(formData.get("location")),
    gear: textOrNull(formData.get("gear")),
    camera: textOrNull(formData.get("camera")),
    dive_log: textOrNull(formData.get("diveLog")),
    published_at: publishedAt,
  };
}

async function normalizeHomepageFlags(idToKeepFeatured?: number, shouldBeFeatured?: boolean) {
  if (shouldBeFeatured) {
    let query = supabaseAdmin.from("posts").update({ is_featured: false });
    if (typeof idToKeepFeatured === "number") {
      query = query.neq("id", idToKeepFeatured);
    } else {
      query = query.neq("id", 0);
    }
    await query;
  }
}

export async function createPost(formData: FormData) {
  const payload = buildPostPayload(formData);

  await normalizeHomepageFlags(undefined, payload.is_featured);

  const { error } = await supabaseAdmin.from("posts").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/search");
  revalidatePath("/admin");
  redirect("/admin?created=1");
}

export async function updatePost(id: number, formData: FormData) {
  const payload = buildPostPayload(formData, { keepPublishedDate: true });

  await normalizeHomepageFlags(id, payload.is_featured);

  const { error } = await supabaseAdmin
    .from("posts")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/search");
  revalidatePath("/admin");
  revalidatePath(`/posts/${payload.slug}`);
  redirect("/admin?saved=1");
}

export async function quickUpdatePost(id: number, formData: FormData) {
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("featured") === "on";
  const isEditorsPick = formData.get("editorsPick") === "on";
  const editorsPickOrder = isEditorsPick
    ? parseEditorsPickOrder(formData.get("editorsPickOrder"))
    : null;

  await normalizeHomepageFlags(id, isFeatured);

  const updatePayload = {
    status,
    is_featured: isFeatured,
    is_editors_pick: isEditorsPick,
    editors_pick_order: editorsPickOrder,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("posts").update(updatePayload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/search");
  revalidatePath("/admin");
}

export async function deletePost(id: number) {
  const { data: existing } = await supabaseAdmin
    .from("posts")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/search");
  revalidatePath("/admin");

  if (existing?.slug) {
    revalidatePath(`/posts/${existing.slug}`);
  }

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

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/search");
  revalidatePath("/admin");
  redirect("/admin?duplicated=1");
}

export async function createDashboardUser(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function saveSiteSettings(formData: FormData) {
  const heroSlidesRaw = String(formData.get("heroSlidesPayload") || "[]");

  let heroSlides: Array<{ image: string; caption: string }> = [];

  try {
    const parsed = JSON.parse(heroSlidesRaw);
    if (Array.isArray(parsed)) {
      heroSlides = parsed
        .filter(
          (item) =>
            item &&
            typeof item.image === "string" &&
            item.image.trim().length > 0
        )
        .slice(0, 5)
        .map((item) => ({
          image: String(item.image || "").trim(),
          caption: String(item.caption || "").trim(),
        }));
    }
  } catch {
    heroSlides = [];
  }

  const payload = {
    hero_slides: heroSlides,
    about_title: String(formData.get("about_title") || ""),
    about_intro: String(formData.get("about_intro") || ""),
    about_body: String(formData.get("about_body") || ""),
    contact_title: String(formData.get("contact_title") || ""),
    contact_intro: String(formData.get("contact_intro") || ""),
    contact_email: String(formData.get("contact_email") || ""),
    contact_body: String(formData.get("contact_body") || ""),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}