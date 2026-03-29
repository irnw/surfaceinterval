"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type HeroSlide = {
  image: string;
  caption: string;
};

export default function Hero({
  settings,
}: {
  settings: Record<string, any> | null;
}) {
  const slides = useMemo<HeroSlide[]>(() => {
    const rawSlides = Array.isArray(settings?.hero_slides) ? settings.hero_slides : [];
    return rawSlides
      .filter((item: any) => item && typeof item.image === "string" && item.image.trim().length > 0)
      .slice(0, 5)
      .map((item: any) => ({ image: item.image, caption: item.caption || "" }));
  }, [settings]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => { setActiveIndex(0); }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const copyStrong = settings?.hero_copy_strong || "A personal journal at the intersection of depth, distance, and detail.";
  const copySoft = settings?.hero_copy_soft || "Essays, dive logs, travel, and the quieter moments in between.";

  return (
    <section className="hero-v2">

      {/* ── Full-bleed photo ── */}
      <div className="hero-v2-media">

        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={`${slide.image}-${index}`}
              className={`hero-v2-slide ${index === activeIndex ? "is-active" : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))
        ) : (
          <div className="hero-v2-placeholder" />
        )}

        {/* Scrim — lower 50% only */}
        <div className="hero-v2-scrim" />

        {/* Eyebrow — top left */}
        <div className="hero-v2-eyebrow">From the deep end of the world</div>

        {/* Bottom overlay: title + caption in a single anchor */}
        <div className="hero-v2-bottom">
          <div className="hero-v2-bottom-left">
            {/* Title — Surface [white] Interval [purple], one line */}
            <h1 className="hero-v2-title">
              <span className="hero-v2-title-main">Surface</span>
              <span className="hero-v2-title-accent"> Interval</span>
            </h1>
            {/* Caption — directly below title, always visible */}
            {slides[activeIndex]?.caption && (
              <div className="hero-v2-caption">{slides[activeIndex].caption}</div>
            )}
          </div>

          {/* Dots — bottom right, same row as title */}
          {slides.length > 1 && (
            <div className="hero-v2-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`hero-v2-dot ${index === activeIndex ? "is-active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Intro strip — below image, invites scroll ── */}
      <div className="hero-v2-strip">
        <div className="hero-v2-strip-inner">
          <div className="hero-v2-strip-copy">
            <p className="hero-v2-copy-strong">{copyStrong}</p>
            <p className="hero-v2-copy-soft">{copySoft}</p>
          </div>
          <div className="hero-v2-tags">
            <Link href="/category/diving" className="hero-v2-tag">Diving</Link>
            <Link href="/category/travel" className="hero-v2-tag">Travel</Link>
            <Link href="/category/gear" className="hero-v2-tag">Gear</Link>
            <Link href="/category/personal" className="hero-v2-tag">Personal</Link>
          </div>
        </div>
        {/* Scroll cue */}
        <div className="hero-v2-scroll-cue">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

    </section>
  );
}