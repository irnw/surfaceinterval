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

  // ── Photo ────────────────────────────────────────
  const photoUrl: string | null = settings?.about_photo ?? null

  // ── Header ───────────────────────────────────────
  // about_intro is the tagline shown under "By Irene W."
  const tagline: string =
    settings?.about_intro ??
    'For the quieter moments in between. Not to document — just to slow things down enough to see clearly.'

  // ── Body ─────────────────────────────────────────
  const bodyText: string = settings?.about_body ?? ''

  // ── Credentials ──────────────────────────────────
  // Dashboard field names confirmed: about_certification, about_diving_since,
  // about_oceans, about_camera, about_based
  const certification: string  = settings?.about_certification ?? ''
  const divingSince: string    = settings?.about_diving_since ?? ''
  const oceansDived: string    = settings?.about_oceans ?? ''
  const camera: string         = settings?.about_camera ?? ''
  const basedIn: string        = settings?.about_based ?? ''   // ← was about_based_in (wrong)

  // ── Collab / contact ─────────────────────────────
  const collabNote: string  = settings?.collaboration_note ?? ''
  const collabEmail: string = settings?.contact_email ?? ''

  const bodyParagraphs = bodyText.split('\n').map(p => p.trim()).filter(Boolean)

  return (
    <>
      <Header />

      <main className="about-shell">

        {/* ── HEADER ─────────────────────────────── */}
        <header className="about-header">
          <p className="about-kicker">By Irene W.</p>
          <p className="about-intro">{tagline}</p>
        </header>

        {/* ── PORTRAIT ───────────────────────────── */}
        {photoUrl && (
          <figure className="about-portrait-wrap">
            <div className="about-portrait">
              <Image
                src={photoUrl}
                alt="Irene W."
                fill
                sizes="(max-width: 768px) 100vw, 1100px"
                className="about-portrait-img"
                priority
              />
            </div>
          </figure>
        )}

        {/* ── BODY COPY ──────────────────────────── */}
        {bodyParagraphs.length > 0 && (
          <section className="about-body prose">
            {bodyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        )}

        {/* ── CREDENTIALS ────────────────────────── */}
        {(certification || divingSince || oceansDived || camera || basedIn) && (
          <aside className="about-credentials">
            {certification && (
              <div className="about-credential">
                <span className="about-credential-label">Certification</span>
                <span className="about-credential-value">{certification}</span>
              </div>
            )}
            {divingSince && (
              <div className="about-credential">
                <span className="about-credential-label">Diving since</span>
                <span className="about-credential-value">{divingSince}</span>
              </div>
            )}
            {oceansDived && (
              <div className="about-credential">
                <span className="about-credential-label">Dived in</span>
                <span className="about-credential-value">{oceansDived}</span>
              </div>
            )}
            {camera && (
              <div className="about-credential">
                <span className="about-credential-label">Camera</span>
                <span className="about-credential-value">{camera}</span>
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

        {/* ── COLLAB / CONTACT ───────────────────── */}
        <section className="about-collab">
          <p className="about-collab-label">Let&rsquo;s talk</p>
          {collabNote ? (
            <p className="about-collab-text">{collabNote}</p>
          ) : (
            <p className="about-collab-text">
              A line, a thought, or a different perspective — all welcome.
            </p>
          )}
          {collabEmail && (
            <a href={`mailto:${collabEmail}`} className="about-collab-link">
              {collabEmail}
            </a>
          )}
        </section>

      </main>

      <Footer settings={settings} />
    </>
  )
}