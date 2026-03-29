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

export default async function AboutPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings").select("*")
    .order("id", { ascending: true }).limit(1).maybeSingle();

  const paragraphs = String(settings?.about_body || "")
    .split("\n").map((p: string) => p.trim()).filter(Boolean);

  return (
    <>
      <Header />

      <main className="about-shell">

        {/* ── HERO ── */}
        <div className="about-hero">
          <div className="about-hero-text">
            <div className="about-kicker">About</div>
            <h1 className="about-title">
              {settings?.about_title || ""}
            </h1>
            <p className="about-intro">
              {settings?.about_intro ||
                "Surface Interval is a writing and image-led journal about diving, travel, gear, and the quieter observations that stay with you after the trip is over."}
            </p>
          </div>

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

        {/* ── CREDENTIALS STRIP — all from settings ── */}
        <div className="about-credentials">
          {(settings?.about_certification || "PADI Rescue Diver · EFR") && (
            <div className="about-credential">
              <div className="about-credential-label">Certification</div>
              <div className="about-credential-value">
                {settings?.about_certification || "PADI Rescue Diver · EFR"}
              </div>
            </div>
          )}
          {(settings?.about_diving_since || "2015") && (
            <div className="about-credential">
              <div className="about-credential-label">Diving since</div>
              <div className="about-credential-value">
                {settings?.about_diving_since || "2015"}
              </div>
            </div>
          )}
          {(settings?.about_oceans || "Indian · Red Sea · Pacific") && (
            <div className="about-credential">
              <div className="about-credential-label">Oceans dived</div>
              <div className="about-credential-value">
                {settings?.about_oceans || "Indian · Red Sea · Pacific"}
              </div>
            </div>
          )}
          {(settings?.about_camera || "OM System OM-1 · GoPro Hero 13") && (
            <div className="about-credential">
              <div className="about-credential-label">Camera</div>
              <div className="about-credential-value">
                {settings?.about_camera || "OM System OM-1 · GoPro Hero 13"}
              </div>
            </div>
          )}
          {(settings?.about_based || "Singapore") && (
            <div className="about-credential">
              <div className="about-credential-label">Based in</div>
              <div className="about-credential-value">
                {settings?.about_based || "Singapore"}
              </div>
            </div>
          )}
        </div>

        <div className="about-rule" />

        {/* ── BODY TEXT ── */}
        {paragraphs.length > 0 && (
          <article className="about-body prose">
            {paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        )}

        {paragraphs.length > 0 && <div className="about-rule" />}

        {/* ── COLLABORATION ── */}
        <div className="about-collab">
             <div className="about-collab-label">Let's Talk</div>

            {settings?.collaboration_note ? (
                <p className="about-collab-text">{settings.collaboration_note}</p>
            ) : (
                 <div className="about-collab-text">
                    <p>A line, a thought, or a different perspective — all welcome.</p>
                    <p>If something here resonated, feel free to reach out.</p>

                    <p>Open to notes, reflections, or anything this space brings up.</p>
                    <p>Simple is enough.</p>

                    <p>No need to overthink it.</p>
                </div>
            )}

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