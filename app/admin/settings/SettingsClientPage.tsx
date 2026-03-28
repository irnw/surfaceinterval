"use client";

import { useState } from "react";
import MediaLibrary from "../../components/MediaLibrary";
import { saveSiteSettings } from "../actions";

type HeroSlide = { image: string; caption: string };
type ShelfBook = { title: string; author: string; note: string };
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
      ? initialSettings.hero_slides.slice(0, 5) : []
  );
  const [heroPickerOpen, setHeroPickerOpen] = useState<number | null>(null);
  const [aboutPhotoPickerOpen, setAboutPhotoPickerOpen] = useState(false);
  const [aboutPhoto, setAboutPhoto] = useState(initialSettings?.about_photo || "");
  const [aboutTitle, setAboutTitle] = useState(initialSettings?.about_title || "");
  const [aboutIntro, setAboutIntro] = useState(initialSettings?.about_intro || "");
  const [aboutBody, setAboutBody] = useState(initialSettings?.about_body || "");
  const [collaborationNote, setCollaborationNote] = useState(initialSettings?.collaboration_note || "");
  const [contactTitle, setContactTitle] = useState(initialSettings?.contact_title || "");
  const [contactIntro, setContactIntro] = useState(initialSettings?.contact_intro || "");
  const [contactEmail, setContactEmail] = useState(initialSettings?.contact_email || "");
  const [contactBody, setContactBody] = useState(initialSettings?.contact_body || "");
  const [divesLogged, setDivesLogged] = useState(initialSettings?.dives_logged || "");
  const [countriesReached, setCountriesReached] = useState(initialSettings?.countries_reached || "");

  const [shelf, setShelf] = useState<ShelfBook[]>(
    Array.isArray(initialSettings?.reading_shelf)
      ? initialSettings.reading_shelf.slice(0, 6) : []
  );

  function updateBook(index: number, field: keyof ShelfBook, value: string) {
    const copy = [...shelf];
    copy[index] = { ...copy[index], [field]: value };
    setShelf(copy);
  }

  function addBook() {
    if (shelf.length >= 6) return;
    setShelf([...shelf, { title: "", author: "", note: "" }]);
  }

  function removeBook(index: number) {
    const copy = [...shelf]; copy.splice(index, 1); setShelf(copy);
  }

  function updateSlide(index: number, next: HeroSlide) {
    const copy = [...heroSlides]; copy[index] = next; setHeroSlides(copy);
  }

  function addSlide() {
    if (heroSlides.length >= 5) return;
    setHeroSlides([...heroSlides, { image: "", caption: "" }]);
  }

  function removeSlide(index: number) {
    const copy = [...heroSlides]; copy.splice(index, 1); setHeroSlides(copy);
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Settings</h2>
          <p>Edit homepage, about page, reading shelf, and contact details from one place.</p>
        </div>
      </div>

      {saved ? <div className="admin-banner">Settings saved.</div> : null}

      <form action={saveSiteSettings}>
        <input type="hidden" name="heroSlidesPayload" value={JSON.stringify(heroSlides)} />
        <input type="hidden" name="readingShelfPayload" value={JSON.stringify(shelf)} />
        <input type="hidden" name="about_photo" value={aboutPhoto} />

        {/* ── HOMEPAGE STATS ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Homepage Stats</h3>
          <p className="admin-settings-note">Update after each trip or milestone.</p>
          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Dives Logged</label>
              <input name="dives_logged" value={divesLogged} placeholder="e.g. 500+"
                onChange={(e) => setDivesLogged(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Countries Reached</label>
              <input name="countries_reached" value={countriesReached} placeholder="e.g. 40+"
                onChange={(e) => setCountriesReached(e.target.value)} />
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
                  <button type="button" onClick={() => removeSlide(index)}>Remove</button>
                </div>
                <input placeholder="Image URL" value={slide.image}
                  onChange={(e) => updateSlide(index, { ...slide, image: e.target.value })} />
                <input placeholder="Caption" value={slide.caption}
                  onChange={(e) => updateSlide(index, { ...slide, caption: e.target.value })} />
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
              <button type="button" onClick={addSlide}>+ Add Hero Slide</button>
            ) : null}
          </div>
        </div>

        {/* ── ABOUT PAGE ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">About Page</h3>
          <div className="admin-settings-grid">

            {/* Portrait photo */}
            <div className="admin-setting is-full">
              <label>Portrait Photo</label>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <input value={aboutPhoto} placeholder="Photo URL"
                  onChange={(e) => setAboutPhoto(e.target.value)}
                  style={{ flex: 1 }} />
                <button type="button" onClick={() => setAboutPhotoPickerOpen(true)}
                  style={{ whiteSpace: "nowrap" }}>
                  Select from Media
                </button>
                {aboutPhoto && (
                  <button type="button" onClick={() => setAboutPhoto("")}>Clear</button>
                )}
              </div>
              {aboutPhoto && (
                <div style={{ marginTop: 10 }}>
                  <img src={aboutPhoto} alt="Portrait"
                    style={{ height: 120, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }} />
                </div>
              )}
            </div>

            <div className="admin-setting">
              <label>About Title</label>
              <input name="about_title" value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>About Intro</label>
              <textarea name="about_intro" rows={3} value={aboutIntro}
                onChange={(e) => setAboutIntro(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>About Body</label>
              <textarea name="about_body" rows={8} value={aboutBody}
                onChange={(e) => setAboutBody(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Collaboration Note</label>
              <textarea name="collaboration_note" rows={3} value={collaborationNote}
                onChange={(e) => setCollaborationNote(e.target.value)}
                placeholder="Describe what kinds of work you're open to..." />
            </div>
          </div>
        </div>

        {/* ── ON THE SHELF ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">On the Shelf</h3>
          <p className="admin-settings-note">
            A curated list of books shown on the About page. Maximum 6.
          </p>
          <div className="shelf-manager">
            {shelf.map((book, index) => (
              <div key={index} className="shelf-book-card">
                <div className="shelf-book-card-head">
                  <strong>Book {index + 1}</strong>
                  <button type="button" onClick={() => removeBook(index)}>Remove</button>
                </div>
                <div className="admin-settings-grid" style={{ padding: 14 }}>
                  <div className="admin-setting">
                    <label>Title</label>
                    <input value={book.title} placeholder="Book title"
                      onChange={(e) => updateBook(index, "title", e.target.value)} />
                  </div>
                  <div className="admin-setting">
                    <label>Author</label>
                    <input value={book.author} placeholder="Author name"
                      onChange={(e) => updateBook(index, "author", e.target.value)} />
                  </div>
                  <div className="admin-setting is-full">
                    <label>Note <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                    <input value={book.note} placeholder="Why it's there..."
                      onChange={(e) => updateBook(index, "note", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            {shelf.length < 6 ? (
              <button type="button" className="shelf-add-btn" onClick={addBook}>
                + Add book
              </button>
            ) : (
              <p className="admin-settings-note">Maximum of 6 books reached.</p>
            )}
          </div>
        </div>

        {/* ── CONTACT PAGE ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Contact Page</h3>
          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Contact Title</label>
              <input name="contact_title" value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Contact Email</label>
              <input name="contact_email" value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Contact Intro</label>
              <textarea name="contact_intro" rows={3} value={contactIntro}
                onChange={(e) => setContactIntro(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Contact Body</label>
              <textarea name="contact_body" rows={6} value={contactBody}
                onChange={(e) => setContactBody(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="admin-settings-actions">
          <button type="submit">Save Settings</button>
        </div>
      </form>

      {/* Hero slide media picker */}
      {heroPickerOpen !== null ? (
        <div className="media-modal-overlay" onClick={() => setHeroPickerOpen(null)}>
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-head">
              <h3>Select hero image</h3>
              <button type="button" onClick={() => setHeroPickerOpen(null)}>Close</button>
            </div>
            <MediaLibrary onSelect={(url) => {
              updateSlide(heroPickerOpen, { ...heroSlides[heroPickerOpen], image: url });
              setHeroPickerOpen(null);
            }} />
          </div>
        </div>
      ) : null}

      {/* About photo media picker */}
      {aboutPhotoPickerOpen ? (
        <div className="media-modal-overlay" onClick={() => setAboutPhotoPickerOpen(false)}>
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-head">
              <h3>Select portrait photo</h3>
              <button type="button" onClick={() => setAboutPhotoPickerOpen(false)}>Close</button>
            </div>
            <MediaLibrary onSelect={(url) => {
              setAboutPhoto(url);
              setAboutPhotoPickerOpen(false);
            }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}