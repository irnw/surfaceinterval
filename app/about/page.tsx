export const revalidate = 0;

import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";

export const metadata: Metadata = {
  title: "About",
  description: "About Surface Interval and the editorial lens behind it.",
  openGraph: {
    title: "About · Surface Interval",
    description: "About Surface Interval and the editorial lens behind it.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About · Surface Interval",
    description: "About Surface Interval and the editorial lens behind it.",
  },
};

type ShelfBook = { title: string; author: string; note?: string };

export default async function AboutPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings").select("*")
    .order("id", { ascending: true }).limit(1).maybeSingle();

  const paragraphs = String(settings?.about_body || "")
    .split("\n").map((p: string) => p.trim()).filter(Boolean);

  const shelf: ShelfBook[] = Array.isArray(settings?.reading_shelf)
    ? (settings.reading_shelf as ShelfBook[]).slice(0, 6) : [];

  return (
    <>
      <Header />

      <main className="about-shell">

        {/* Hero */}
        <div className="about-hero">
          <div className="about-hero-text">
            <div className="about-kicker">About</div>
            <h1 className="about-title">
              {settings?.about_title || "A journal from the deep end of the world."}
            </h1>
            <p className="about-intro">
              {settings?.about_intro ||
                "Surface Interval is a writing and image-led journal about diving, travel, gear, and the quieter observations that stay with you after the trip is over."}
            </p>
          </div>

          {/* Portrait — set via Settings > About Page > Portrait Photo */}
          {settings?.about_photo ? (
            <div className="about-portrait">
              <img src={settings.about_photo} alt="Irene W" />
            </div>
          ) : (
            <div className="about-portrait about-portrait--placeholder">
              <div className="about-portrait-label">Irene W</div>
            </div>
          )}
        </div>

        <div className="about-rule" />

        {/* Credentials strip */}
        <div className="about-credentials">
          <div className="about-credential">
            <div className="about-credential-label">Certification</div>
            <div className="about-credential-value">PADI Rescue Diver · EFR</div>
          </div>
          <div className="about-credential">
            <div className="about-credential-label">Diving since</div>
            <div className="about-credential-value">2015</div>
          </div>
          <div className="about-credential">
            <div className="about-credential-label">Oceans dived</div>
            <div className="about-credential-value">Indian · Red Sea · Pacific</div>
          </div>
          <div className="about-credential">
            <div className="about-credential-label">Camera</div>
            <div className="about-credential-value">OM System OM-1 · GoPro Hero 13</div>
          </div>
          <div className="about-credential">
            <div className="about-credential-label">Based in</div>
            <div className="about-credential-value">Singapore</div>
          </div>
        </div>

        <div className="about-rule" />

        {/* Body text */}
        {paragraphs.length > 0 && (
          <article className="about-body prose">
            {paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        )}

        {/* On the Shelf */}
        {shelf.length > 0 && (
          <div className="about-shelf-section">
            <div className="about-rule" />
            <div className="about-shelf-head">
              <div className="about-shelf-label">On the Shelf</div>
              <p className="about-shelf-intro">A few books currently within reach.</p>
            </div>
            <div className="about-shelf-grid">
              {shelf.map((book, i) => (
                <div key={i} className="about-shelf-book">
                  <div className="about-shelf-spine" />
                  <div className="about-shelf-book-body">
                    <div className="about-shelf-book-title">{book.title}</div>
                    <div className="about-shelf-book-author">{book.author}</div>
                    {book.note && (
                      <div className="about-shelf-book-note">{book.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="about-rule" />

        {/* Collaboration */}
        <div className="about-collab">
          <div className="about-collab-label">Work together</div>
          <p className="about-collab-text">
            {settings?.collaboration_note ||
              "Open to selected collaborations across editorial work, travel and diving features, gear storytelling, and brand partnerships that fit the tone of this journal."}
          </p>
          {settings?.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="about-collab-link">
              {settings.contact_email}
            </a>
          )}
        </div>

      </main>

      <Footer settings={settings} />
    </>
  );
}