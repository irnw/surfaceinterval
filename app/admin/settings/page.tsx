import { createSupabaseServerClient } from "../../lib/supabase-server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  async function saveSettings(formData: FormData) {
    "use server";

    const payload = {
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

    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    redirect("/admin/settings?saved=1");
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Settings</h2>
          <p>Edit your About and Contact page content here.</p>
        </div>
      </div>

      <form action={saveSettings} className="admin-settings-grid">
        <div className="admin-setting is-full">
          <label>About Title</label>
          <input
            name="about_title"
            defaultValue={settings?.about_title || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>About Intro</label>
          <textarea
            name="about_intro"
            rows={3}
            defaultValue={settings?.about_intro || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>About Body</label>
          <textarea
            name="about_body"
            rows={8}
            defaultValue={settings?.about_body || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>Contact Title</label>
          <input
            name="contact_title"
            defaultValue={settings?.contact_title || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>Contact Intro</label>
          <textarea
            name="contact_intro"
            rows={3}
            defaultValue={settings?.contact_intro || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>Contact Email</label>
          <input
            name="contact_email"
            defaultValue={settings?.contact_email || ""}
          />
        </div>

        <div className="admin-setting is-full">
          <label>Contact Body</label>
          <textarea
            name="contact_body"
            rows={8}
            defaultValue={settings?.contact_body || ""}
          />
        </div>

        <div className="admin-settings-actions">
          <button type="submit">Save Settings</button>
        </div>
      </form>
    </div>
  );
}