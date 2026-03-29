"use client";

import { useState } from "react";
import MediaLibrary from "../../components/MediaLibrary";
import ImageCropper from "../../components/ImageCropper";
import { saveSiteSettings } from "../actions";

type HeroSlide = { image: string; caption: string };
type ShelfBook = { title: string; author: string; note: string; cover: string };
type SettingsRecord = Record<string, any>;

async function fetchBookCover(title: string): Promise<string> {
  if (!title.trim()) return "";
  const query = encodeURIComponent(title.trim());
  const res = await fetch(`https://openlibrary.org/search.json?title=${query}&limit=1&fields=cover_i`);
  if (!res.ok) return "";
  const data = await res.json();
  const coverId = data?.docs?.[0]?.cover_i;
  if (!coverId) return "";
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

export default function SettingsClientPage({
  initialSettings,
  saved,
}: {
  initialSettings: SettingsRecord;
  saved?: boolean;
}) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    Array.isArray(initialSettings?.hero_slides) ? initialSettings.hero_slides.slice(0, 5) : []
  );
  const [heroPickerOpen, setHeroPickerOpen] = useState<number | null>(null);
  const [heroCropTarget, setHeroCropTarget] = useState<{ index: number; src: string } | null>(null);

  const [aboutPhoto, setAboutPhoto] = useState(initialSettings?.about_photo || "");
  const [aboutPhotoPickerOpen, setAboutPhotoPickerOpen] = useState(false);
  const [aboutPhotoCropSrc, setAboutPhotoCropSrc] = useState<string | null>(null);

  const [aboutTitle, setAboutTitle] = useState(initialSettings?.about_title || "");
  const [aboutIntro, setAboutIntro] = useState(initialSettings?.about_intro || "");
  const [aboutBody, setAboutBody] = useState(initialSettings?.about_body || "");
  const [aboutCertification, setAboutCertification] = useState(initialSettings?.about_certification || "PADI Rescue Diver · EFR");
  const [aboutDivingSince, setAboutDivingSince] = useState(initialSettings?.about_diving_since || "2015");
  const [aboutOceans, setAboutOceans] = useState(initialSettings?.about_oceans || "Indian · Red Sea · Pacific");
  const [aboutCamera, setAboutCamera] = useState(initialSettings?.about_camera || "OM System OM-1 · GoPro Hero 13");
  const [aboutBased, setAboutBased] = useState(initialSettings?.about_based || "Singapore");
  const [collaborationNote, setCollaborationNote] = useState(initialSettings?.collaboration_note || "");
  const [contactTitle, setContactTitle] = useState(initialSettings?.contact_title || "");
  const [contactIntro, setContactIntro] = useState(initialSettings?.contact_intro || "");
  const [contactEmail, setContactEmail] = useState(initialSettings?.contact_email || "");
  const [contactBody, setContactBody] = useState(initialSettings?.contact_body || "");
  const [divesLogged, setDivesLogged] = useState(initialSettings?.dives_logged || "");
  const [countriesReached, setCountriesReached] = useState(initialSettings?.countries_reached || "");

  const [shelf, setShelf] = useState<ShelfBook[]>(
    Array.isArray(initialSettings?.reading_shelf)
      ? initialSettings.reading_shelf.slice(0, 6).map((b: any) => ({
          title: b.title || "", author: b.author || "", note: b.note || "", cover: b.cover || "",
        }))
      : []
  );
  const [fetchingCover, setFetchingCover] = useState<number | null>(null);
  const [coverPickerIndex, setCoverPickerIndex] = useState<number | null>(null);

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

  function updateBook(index: number, field: keyof ShelfBook, value: string) {
    const copy = [...shelf]; copy[index] = { ...copy[index], [field]: value }; setShelf(copy);
  }
  function addBook() {
    if (shelf.length >= 6) return;
    setShelf([...shelf, { title: "", author: "", note: "", cover: "" }]);
  }
  function removeBook(index: number) {
    const copy = [...shelf]; copy.splice(index, 1); setShelf(copy);
  }
  async function handleFetchCover(index: number) {
    if (!shelf[index].title.trim()) return;
    setFetchingCover(index);
    try {
      const url = await fetchBookCover(shelf[index].title);
      if (url) updateBook(index, "cover", url);
      else alert("No cover found. Try uploading manually.");
    } catch { alert("Could not fetch cover."); }
    finally { setFetchingCover(null); }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>Settings</h2><p>Manage all site content from one place.</p></div>
      </div>

      {saved ? <div className="admin-banner">Settings saved.</div> : null}

      <form action={saveSiteSettings}>
        <input type="hidden" name="heroSlidesPayload" value={JSON.stringify(heroSlides)} />
        <input type="hidden" name="readingShelfPayload" value={JSON.stringify(shelf)} />
        <input type="hidden" name="about_photo" value={aboutPhoto} />

        {/* ── STATS ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Homepage Stats</h3>
          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Dives Logged</label>
              <input name="dives_logged" value={divesLogged} placeholder="e.g. 344" onChange={(e) => setDivesLogged(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Countries Reached</label>
              <input name="countries_reached" value={countriesReached} placeholder="e.g. 35" onChange={(e) => setCountriesReached(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── HERO SLIDES ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Homepage Hero Slides</h3>
          <p className="admin-settings-note">
            Crop each image to 16:9 for the best result on the full-bleed hero.
          </p>
          <div className="hero-slide-manager">
            {heroSlides.map((slide, index) => (
              <div key={index} className="hero-slide-card">
                <div className="hero-slide-card-head">
                  <strong>Slide {index + 1}</strong>
                  <button type="button" onClick={() => removeSlide(index)}>Remove</button>
                </div>

                {/* Image preview with crop button */}
                {slide.image ? (
                  <div className="hero-slide-preview-wrap">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="hero-slide-preview-img"
                    />
                    <div className="hero-slide-preview-actions">
                      <button
                        type="button"
                        className="pef-btn-ghost"
                        onClick={() => setHeroCropTarget({ index, src: slide.image })}
                      >
                        Crop to 16:9
                      </button>
                      <button
                        type="button"
                        className="pef-btn-ghost pef-btn-ghost--muted"
                        onClick={() => updateSlide(index, { ...slide, image: "" })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : null}

                <input
                  placeholder="Image URL"
                  value={slide.image}
                  onChange={(e) => updateSlide(index, { ...slide, image: e.target.value })}
                />
                <input
                  placeholder="Caption (location, year)"
                  value={slide.caption}
                  onChange={(e) => updateSlide(index, { ...slide, caption: e.target.value })}
                />
                <div className="hero-slide-card-actions">
                  <button type="button" onClick={() => setHeroPickerOpen(index)}>
                    Choose from Media Library
                  </button>
                </div>
              </div>
            ))}
            {heroSlides.length < 5 && (
              <button type="button" onClick={addSlide}>+ Add Slide</button>
            )}
          </div>
        </div>

        {/* ── ABOUT PAGE ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">About Page</h3>
          <div className="admin-settings-grid">
            <div className="admin-setting is-full">
              <label>Portrait Photo</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                <input value={aboutPhoto} placeholder="Photo URL"
                  onChange={(e) => setAboutPhoto(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                <button type="button" onClick={() => setAboutPhotoPickerOpen(true)}>Choose from Media</button>
                {aboutPhoto && (
                  <>
                    <button type="button" onClick={() => setAboutPhotoCropSrc(aboutPhoto)}>Crop 3:4</button>
                    <button type="button" onClick={() => setAboutPhoto("")}>Clear</button>
                  </>
                )}
              </div>
              {aboutPhoto && (
                <img src={aboutPhoto} alt="Portrait"
                  style={{ height: 160, marginTop: 10, borderRadius: 10, objectFit: "cover", border: "1px solid var(--line)" }} />
              )}
            </div>
            <div className="admin-setting">
              <label>Title</label>
              <input name="about_title" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Intro</label>
              <textarea name="about_intro" rows={3} value={aboutIntro} onChange={(e) => setAboutIntro(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Body</label>
              <textarea name="about_body" rows={8} value={aboutBody} onChange={(e) => setAboutBody(e.target.value)} />
            </div>
          </div>

          <h4 className="admin-settings-subtitle">Credentials</h4>
          <div className="admin-settings-grid">
            <div className="admin-setting">
              <label>Certification</label>
              <input name="about_certification" value={aboutCertification} onChange={(e) => setAboutCertification(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Diving Since</label>
              <input name="about_diving_since" value={aboutDivingSince} onChange={(e) => setAboutDivingSince(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Oceans Dived</label>
              <input name="about_oceans" value={aboutOceans} onChange={(e) => setAboutOceans(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Camera</label>
              <input name="about_camera" value={aboutCamera} onChange={(e) => setAboutCamera(e.target.value)} />
            </div>
            <div className="admin-setting">
              <label>Based In</label>
              <input name="about_based" value={aboutBased} onChange={(e) => setAboutBased(e.target.value)} />
            </div>
            <div className="admin-setting is-full">
              <label>Collaboration Note</label>
              <textarea name="collaboration_note" rows={3} value={collaborationNote}
                onChange={(e) => setCollaborationNote(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── ON THE SHELF ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">On the Shelf</h3>
          <p className="admin-settings-note">Shown on the homepage. Maximum 6 books. Type a title then click "Fetch Cover".</p>
          <div className="shelf-manager">
            {shelf.map((book, index) => (
              <div key={index} className="shelf-book-card">
                <div className="shelf-book-card-head">
                  <strong>Book {index + 1}</strong>
                  <button type="button" onClick={() => removeBook(index)}>Remove</button>
                </div>
                <div className="shelf-book-card-body">
                  <div className="shelf-cover-col">
                    <div className="shelf-cover-preview">
                      {book.cover ? <img src={book.cover} alt="Cover" /> : <div className="shelf-cover-empty"><span>No cover</span></div>}
                    </div>
                    <div className="shelf-cover-actions">
                      <button type="button" className="shelf-fetch-btn"
                        onClick={() => handleFetchCover(index)}
                        disabled={fetchingCover === index || !book.title.trim()}>
                        {fetchingCover === index ? "Fetching…" : "Fetch Cover"}
                      </button>
                      <button type="button" className="shelf-fetch-btn shelf-fetch-btn--ghost" onClick={() => setCoverPickerIndex(index)}>Upload</button>
                      {book.cover && <button type="button" className="shelf-fetch-btn shelf-fetch-btn--ghost" onClick={() => updateBook(index, "cover", "")}>Clear</button>}
                    </div>
                  </div>
                  <div className="shelf-fields-col">
                    <div className="admin-setting">
                      <label>Title</label>
                      <input value={book.title} placeholder="Book title" onChange={(e) => updateBook(index, "title", e.target.value)} />
                    </div>
                    <div className="admin-setting">
                      <label>Author</label>
                      <input value={book.author} placeholder="Author name" onChange={(e) => updateBook(index, "author", e.target.value)} />
                    </div>
                    <div className="admin-setting">
                      <label>Note <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                      <input value={book.note} placeholder="Why it's there…" onChange={(e) => updateBook(index, "note", e.target.value)} />
                    </div>
                    <div className="admin-setting">
                      <label>Cover URL</label>
                      <input value={book.cover} placeholder="Auto-filled or paste URL" onChange={(e) => updateBook(index, "cover", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {shelf.length < 6
              ? <button type="button" className="shelf-add-btn" onClick={addBook}>+ Add book</button>
              : <p className="admin-settings-note">Maximum of 6 books reached.</p>
            }
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-title">Contact Page</h3>
          <div className="admin-settings-grid">
            <div className="admin-setting"><label>Title</label><input name="contact_title" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} /></div>
            <div className="admin-setting"><label>Email</label><input name="contact_email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
            <div className="admin-setting is-full"><label>Intro</label><textarea name="contact_intro" rows={3} value={contactIntro} onChange={(e) => setContactIntro(e.target.value)} /></div>
            <div className="admin-setting is-full"><label>Body</label><textarea name="contact_body" rows={6} value={contactBody} onChange={(e) => setContactBody(e.target.value)} /></div>
          </div>
        </div>

        <div className="admin-settings-actions">
          <button type="submit">Save Settings</button>
        </div>
      </form>

      {/* Hero slide picker */}
      {heroPickerOpen !== null && (
        <div className="media-modal-overlay" onClick={() => setHeroPickerOpen(null)}>
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-head">
              <h3>Select image for slide {heroPickerOpen + 1}</h3>
              <button type="button" onClick={() => setHeroPickerOpen(null)}>Close</button>
            </div>
            <MediaLibrary onSelect={(url) => {
              updateSlide(heroPickerOpen, { ...heroSlides[heroPickerOpen], image: url });
              setHeroPickerOpen(null);
            }} />
          </div>
        </div>
      )}

      {/* Hero slide crop — locked to 16:9 */}
      {heroCropTarget && (
        <ImageCropper
          src={heroCropTarget.src}
          aspectRatio={16 / 9}
          onComplete={(url) => {
            updateSlide(heroCropTarget.index, { ...heroSlides[heroCropTarget.index], image: url });
            setHeroCropTarget(null);
          }}
          onCancel={() => setHeroCropTarget(null)}
        />
      )}

      {/* About photo picker */}
      {aboutPhotoPickerOpen && (
        <div className="media-modal-overlay" onClick={() => setAboutPhotoPickerOpen(false)}>
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-head">
              <h3>Select portrait photo</h3>
              <button type="button" onClick={() => setAboutPhotoPickerOpen(false)}>Close</button>
            </div>
            <MediaLibrary onSelect={(url) => { setAboutPhoto(url); setAboutPhotoPickerOpen(false); }} />
          </div>
        </div>
      )}

      {/* About portrait crop — 3:4 */}
      {aboutPhotoCropSrc && (
        <ImageCropper
          src={aboutPhotoCropSrc}
          aspectRatio={3 / 4}
          onComplete={(url) => { setAboutPhoto(url); setAboutPhotoCropSrc(null); }}
          onCancel={() => setAboutPhotoCropSrc(null)}
        />
      )}

      {/* Book cover picker */}
      {coverPickerIndex !== null && (
        <div className="media-modal-overlay" onClick={() => setCoverPickerIndex(null)}>
          <div className="media-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="media-modal-head">
              <h3>Select cover image</h3>
              <button type="button" onClick={() => setCoverPickerIndex(null)}>Close</button>
            </div>
            <MediaLibrary onSelect={(url) => { updateBook(coverPickerIndex, "cover", url); setCoverPickerIndex(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}