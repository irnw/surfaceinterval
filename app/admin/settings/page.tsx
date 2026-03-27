"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Settings = {
  id: number;
  site_title: string;
  author_name: string;
  tagline: string;
  homepage_description: string;
  dives_logged: string;
  countries_reached: string;
  available_for: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_tags: string;
  feature_eyebrow: string;
  feature_title: string;
  feature_body: string;
  feature_image: string;
  quote_text: string;
  quote_author: string;
  footer_left: string;
  footer_right: string;
};

type EditableSettingsKey = Exclude<keyof Settings, "id">;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setSettings(data as Settings);
  }

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("settings")
      .update(settings)
      .eq("id", 1);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Saved successfully.");
  }

  function updateField(key: EditableSettingsKey, value: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function renderField(
    key: EditableSettingsKey,
    label: string,
    multiline = false,
    full = false
  ) {
    if (!settings) return null;

    return (
      <div
        className={`admin-setting ${full ? "is-full" : ""}`}
        key={key}
      >
        <label>{label}</label>

        {multiline ? (
          <textarea
            rows={4}
            value={settings[key] ?? ""}
            onChange={(e) => updateField(key, e.target.value)}
          />
        ) : (
          <input
            value={settings[key] ?? ""}
            onChange={(e) => updateField(key, e.target.value)}
          />
        )}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Settings</h2>
            <p>Loading site content and homepage defaults.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Settings</h2>
          <p>Control site-wide copy, homepage sections, and footer content.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        {renderField("site_title", "Site Title")}
        {renderField("author_name", "Author Name")}
        {renderField("tagline", "Tagline", true, true)}
        {renderField("homepage_description", "Homepage Description", true, true)}
        {renderField("dives_logged", "Dives Logged")}
        {renderField("countries_reached", "Countries Reached")}
        {renderField("available_for", "Available For", true, true)}
        {renderField("hero_eyebrow", "Hero Eyebrow")}
        {renderField("hero_title", "Hero Title")}
        {renderField("hero_subtitle", "Hero Subtitle")}
        {renderField("hero_description", "Hero Description", true, true)}
        {renderField("hero_tags", "Hero Tags")}
        {renderField("feature_eyebrow", "Feature Eyebrow")}
        {renderField("feature_title", "Feature Title", true, true)}
        {renderField("feature_body", "Feature Body", true, true)}
        {renderField("feature_image", "Feature Image URL", true, true)}
        {renderField("quote_text", "About This Journal Quote", true, true)}
        {renderField("quote_author", "Quote Author")}
        {renderField("footer_left", "Footer Left")}
        {renderField("footer_right", "Footer Right", true, true)}
      </div>

      <div className="admin-settings-actions">
        <button onClick={saveSettings}>
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {message ? <span className="admin-save-message">{message}</span> : null}
      </div>
    </div>
  );
}