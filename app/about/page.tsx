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

  // ── Title ────────────────────────────────────────
  const title: string = settings?.about_title ?? 'By Irene W.'

  // ── Tagline / intro ──────────────────────────────
  const tagline: string = settings?.about_intro ?? ''

  // ── Photo ────────────────────────────────────────
  const photoUrl: string | null = settings?.about_photo ?? null

  // ── Body ─────────────────────────────────────────
  const bodyText: string = settings?.about_body ?? ''
  const bodyParagraphs = bodyText.split('\n').map((p: string) => p.trim()).filter(Boolean)

  // ── Credentials (3 only: certification, oceans, based in) ──
  const certification: string = settings?.about_certification ?? ''
  const oceansDived: string   = settings?.about_oceans ?? ''
  const basedIn: string       = settings?.about_based ?? ''

  // ── Let's Talk ───────────────────────────────────
  // Reads contact_intro + contact_body from dashboard
  const collabIntro: string = settings?.contact_intro ?? ''
  const collabBody: string  = settings?.contact_body ?? ''
  const collabEmail: string = settings?.contact_email ?? ''

  // Combine intro + body into paragraphs, fallback to default
  const collabLines = [collabIntro, collabBody]
    .join('\n')
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean)

  return (
    <>
      <Header />

      <main className="about-shell">

        {/* ── HEADER ─────────────────────────────── */}
        <header className="about-header">
          <p className="about-kicker">{title}</p>
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
            {bodyParagraphs.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        )}

        {/* ── CREDENTIALS (certification · oceans · based in) ── */}
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

        {/* ── LET'S TALK ─────────────────────────── */}
        <section className="about-collab">
          <p className="about-collab-label">Let&rsquo;s talk</p>
          {collabLines.length > 0
            ? collabLines.map((para: string, i: number) => (
                <p key={i} className="about-collab-text">{para}</p>
              ))
            : (
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