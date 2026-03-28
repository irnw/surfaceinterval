"use client";

import { useState } from "react";
import MediaLibrary from "../../components/MediaLibrary";
import { saveSiteSettings } from "../actions";

type HeroSlide = {
  image: string;
  caption: string;
};

type SettingsRecord = Record<string, any>;

export default function SettingsClientPage({
  initialSettings,
  saved,
}: {
  initialSettings: SettingsRecord;
  saved?: boolean;
}) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    Array.isArray(initialSettings?.hero_slides)
      ? initialSettings.hero_slides.slice(0, 5)
      : []
  );
  const [heroPickerOpen, setHeroPickerOpen] = useState<number | null>(null);

  const [aboutTitle, setAboutTitle] = useState(initialSettings?.about_title || "");
  const [aboutIntro, setAboutIntro] = useState(initialSettings?.about_intro || "");
  const [aboutBody, setAboutBody] = useState(initialSettings?.about_body || "");
  const [contactTitle, setContactTitle] = useState(initialSettings?.contact_title || "");
  const [contactIntro, setContactIntro] = useState(initialSettings?.contact_intro || "");
  const [contactEmail, setContactEmail] = useState(initialSettings?.contact_email || "");
  const [contactBody, setContactBody] = useState(initialSettings?.contact_body || "");

  // ── NEW: manually editable homepage stats ──
  const [divesLogged, setDivesLogged] = useState(initialSettings?.dives_logged || "");
  const [countriesReached, setCountriesReached] = useState(initialSettings?.countries_reached || "");

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

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Settings</h2>
          <p>Edit homepage hero slides, about page, and contact page from one place.</p>
        </div>
      </div>

      {saved ? <div className="admin-banner">Settings saved.</div> : null}

      <form action={saveSiteSettings}>
        <input
          type="hidden"
          name="heroSlidesPayload"
          value={JSON.stringify(heroSlides)}
        />

        {/* ── HOMEPAGE STATS ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Homepage Stats</h3>
          <p className="admin-settings-note">
            Update these after each trip or milestone. They appear on the homepage stats strip.
          </p>
          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Dives Logged</label>
              <input
                name="dives_logged"
                value={divesLogged}
                placeholder="e.g. 500+"
                onChange={(e) => setDivesLogged(e.target.value)}
              />
            </div>
            <div className="admin-setting">
              <label>Countries Reached</label>
              <input
                name="countries_reached"
                value={countriesReached}
                placeholder="e.g. 40+"
                onChange={(e) => setCountriesReached(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── HERO SLIDES ── */}
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

        {/* ── ABOUT PAGE ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">About Page</h3>

          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>About Title</label>
              <input
                name="about_title"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
              />
            </div>

            <div className="admin-setting is-full">
              <label>About Intro</label>
              <textarea
                name="about_intro"
                rows={4}
                value={aboutIntro}
                onChange={(e) => setAboutIntro(e.target.value)}
              />
            </div>

            <div className="admin-setting is-full">
              <label>About Body</label>
              <textarea
                name="about_body"
                rows={8}
                value={aboutBody}
                onChange={(e) => setAboutBody(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── CONTACT PAGE ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Contact Page</h3>

          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Contact Title</label>
              <input
                name="contact_title"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
              />
            </div>

            <div className="admin-setting">
              <label>Contact Email</label>
              <input
                name="contact_email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="admin-setting is-full">
              <label>Contact Intro</label>
              <textarea
                name="contact_intro"
                rows={4}
                value={contactIntro}
                onChange={(e) => setContactIntro(e.target.value)}
              />
            </div>

            <div className="admin-setting is-full">
              <label>Contact Body</label>
              <textarea
                name="contact_body"
                rows={8}
                value={contactBody}
                onChange={(e) => setContactBody(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-settings-actions">
          <button type="submit">Save Settings</button>
        </div>
      </form>

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