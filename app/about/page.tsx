// app/about/page.tsx
export const revalidate = 0

import { createSupabaseServerClient } from "../lib/supabase-server"
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from "../components/Header"
import Footer from "../components/Footer"

export const metadata: Metadata = {
  title: 'About',
  description: 'Surface Interval — a personal editorial journal on diving, travel and photography, by Irene W.',
}

export default async function AboutPage() {
  const supabase = await createSupabaseServerClient()
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  const photoUrl: string | null = settings?.about_photo ?? null

  const tagline: string =
    settings?.about_tagline ??
    settings?.tagline ??
    'For the quieter moments in between. Not to document — just to slow things down enough to see clearly.'

  const bodyText: string      = settings?.about_body ?? ''
  const certification: string = settings?.about_certification ?? ''
  const oceansDived: string   = settings?.about_oceans ?? ''
  const basedIn: string       = settings?.about_based_in ?? ''
  const collabText: string    = settings?.about_collab ?? ''
  const collabEmail: string   = settings?.about_email ?? ''

  const bodyParagraphs   = bodyText.split('\n').map(p => p.trim()).filter(Boolean)
  const collabParagraphs = collabText.split('\n').map(p => p.trim()).filter(Boolean)

  return (
    <>
      <Header />

      <main className="about-shell">

        {/* ── HEADER ─────────────────────────────────────── */}
        <header className="about-header">
          <p className="about-kicker">Irene W.</p>
          <p className="about-intro">{tagline}</p>
        </header>

        {/* ── PORTRAIT ───────────────────────────────────── */}
        {photoUrl && (
          <figure className="about-portrait-wrap">
            <div className="about-portrait">
              <Image
                src={photoUrl}
                alt="Irene W."
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="about-portrait-img"
                priority
              />
            </div>
          </figure>
        )}

        {/* ── BODY COPY ──────────────────────────────────── */}
        {bodyParagraphs.length > 0 && (
          <section className="about-body prose">
            {bodyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        )}

        {/* ── CREDENTIALS ────────────────────────────────── */}
        {(certification || oceansDived || basedIn) && (
          <aside className="about-credentials">
            {certification && (
              <div className="about-credential">
                <span className="about-credential-label">Certification</span>
                <span className="about-credential-value">{certification}</span>
              </div>
            )}
            {oceansDived && (
              <div className="about-credential">
                <span className="about-credential-label">Dived in</span>
                <span className="about-credential-value">{oceansDived}</span>
              </div>
            )}
            {basedIn && (
              <div className="about-credential">
                <span className="about-credential-label">Based in</span>
                <span className="about-credential-value">{basedIn}</span>
              </div>
            )}
          </aside>
        )}

       {/* ── COLLAB / CONTACT ───────────────────────────── */}
        <section className="about-collab">
        <p className="about-collab-label">Let&rsquo;s talk</p>
        {settings?.collaboration_note ? (
            <p className="about-collab-text">{settings.collaboration_note}</p>
        ) : (
            <p className="about-collab-text">
            A line, a thought, or a different perspective — all welcome.
            If something here resonated, feel free to reach out.
            </p>
        )}
        {settings?.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="about-collab-link">
            {settings.contact_email}
            </a>
        )}
        </section>

      </main>

      <Footer settings={settings} />
    </>
  )
}