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

  const title: string        = settings?.about_title  ?? 'Irene W.'
  const tagline: string      = settings?.about_intro  ?? ''
  const photoUrl: string | null = settings?.about_photo ?? null
  const bodyText: string     = settings?.about_body   ?? ''
  const collabIntro: string  = settings?.contact_intro ?? ''
  const collabBody: string   = settings?.contact_body  ?? ''
  const collabEmail: string  = settings?.contact_email ?? ''

  const bodyParagraphs = bodyText
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean)

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

        {/* ── LET'S TALK ─────────────────────────── */}
        <section className="about-collab">
          <p className="about-collab-label">Let&rsquo;s talk</p>
          {collabLines.length > 0
            ? collabLines.map((para: string, i: number) => (
                <p key={i} className="about-collab-text">{para}</p>
              ))
            : (
              <p className="about-collab-text">
                A line, a thought, or a different perspective — always welcome.
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