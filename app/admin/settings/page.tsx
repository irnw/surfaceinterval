"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import MediaLibrary from "../../components/MediaLibrary";

type HeroSlide = {
  image: string;
  caption: string;
};

type SettingsRecord = Record<string, any>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsRecord>({});
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [heroPickerOpen, setHeroPickerOpen] = useState<number | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (data) {
        setSettings(data);
        setHeroSlides(Array.isArray(data.hero_slides) ? data.hero_slides.slice(0, 5) : []);
      }
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setSaved("");

    const payload = {
      ...settings,
      hero_slides: heroSlides.slice(0, 5),
      id: 1,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("settings").upsert(payload);

    if (!error) {
      setSaved("Saved.");
    }

    setSaving(false);
  }

  function updateSlide(index: number, next: HeroSlide) {
    const copy = [...heroSlides];
    copy[index] = next;
    setHeroSlides(copy);
  }

  function addSlide() {
    if (heroSlides.length >= 5) return;
    setHeroSlides([...heroSlides, { image: "", caption: "" }]);
  }

  function removeSlide(index: number) {
    const copy = [...heroSlides];
    copy.splice(index, 1);
    setHeroSlides(copy);
  }

  function field(
    key: string,
    label: string,
    multiline = false,
    full = false
  ) {
    return (
      <div className={`admin-setting ${full ? "is-full" : ""}`} key={key}>
        <label>{label}</label>

        {multiline ? (
          <textarea
            rows={5}
            value={String(settings[key] || "")}
            onChange={(e) =>
              setSettings({ ...settings, [key]: e.target.value })
            }
          />
        ) : (
          <input
            value={String(settings[key] || "")}
            onChange={(e) =>
              setSettings({ ...settings, [key]: e.target.value })
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Settings</h2>
          <p>Edit homepage hero slides, about page, and contact page from one place.</p>
        </div>
      </div>

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">Homepage Hero Slides</h3>

        <div className="hero-slide-manager">
          {heroSlides.map((slide, index) => (
            <div key={index} className="hero-slide-card">
              <div className="hero-slide-card-head">
                <strong>Slide {index + 1}</strong>
                <button type="button" onClick={() => removeSlide(index)}>
                  Remove
                </button>
              </div>

              <input
                placeholder="Image URL"
                value={slide.image}
                onChange={(e) =>
                  updateSlide(index, { ...slide, image: e.target.value })
                }
              />

              <input
                placeholder="Caption"
                value={slide.caption}
                onChange={(e) =>
                  updateSlide(index, { ...slide, caption: e.target.value })
                }
              />

              <div className="hero-slide-card-actions">
                <button type="button" onClick={() => setHeroPickerOpen(index)}>
                  Select from Media Library
                </button>
              </div>

              {slide.image ? (
                <div className="hero-slide-thumb">
                  <img src={slide.image} alt={`Hero slide ${index + 1}`} />
                </div>
              ) : null}
            </div>
          ))}

          {heroSlides.length < 5 ? (
            <button type="button" onClick={addSlide}>
              + Add Hero Slide
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">About Page</h3>
        <div className="admin-settings-grid">
          {field("about_title", "About Title")}
          {field("about_intro", "About Intro", true, true)}
          {field("about_body", "About Body", true, true)}
        </div>
      </div>

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">Contact Page</h3>
        <div className="admin-settings-grid">
          {field("contact_title", "Contact Title")}
          {field("contact_intro", "Contact Intro", true, true)}
          {field("contact_email", "Contact Email")}
          {field("contact_body", "Contact Body", true, true)}
        </div>
      </div>

      <div className="admin-settings-actions">
        <button type="button" onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {saved ? <div className="admin-save-message">{saved}</div> : null}
      </div>

      {heroPickerOpen !== null ? (
        <div
          className="media-modal-overlay"
          onClick={() => setHeroPickerOpen(null)}
        >
          <div
            className="media-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="media-modal-head">
              <h3>Select hero image</h3>
              <button type="button" onClick={() => setHeroPickerOpen(null)}>
                Close
              </button>
            </div>

            <MediaLibrary
              onSelect={(url) => {
                updateSlide(heroPickerOpen, {
                  ...heroSlides[heroPickerOpen],
                  image: url,
                });
                setHeroPickerOpen(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}