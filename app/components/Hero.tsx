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
    const rawSlides = Array.isArray(settings?.hero_slides)
      ? settings.hero_slides : [];
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

  const eyebrow = settings?.hero_eyebrow || "Travel · Ocean · Photography · Life";
  const titleMain = settings?.hero_title_main || "Surface";
  const titleAccent = settings?.hero_title_accent || "Interval";
  const byline = settings?.hero_byline || "By Irene W";
  const copyStrong = settings?.hero_copy_strong || "A journal from the deep end of the world.";
  const copySoft = settings?.hero_copy_soft || "Dive logs, travel, gear, and the quieter moments in between.";

  return (
    <section className="hero-v2">

      {/* ── Full-bleed photo area ── */}
      <div className="hero-v2-media">

        {/* Slides */}
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

        {/* Dark scrim — bottom gradient for text legibility */}
        <div className="hero-v2-scrim" />

        {/* Eyebrow — top left */}
        <div className="hero-v2-eyebrow">{eyebrow}</div>

        {/* Byline — top right */}
        <div className="hero-v2-byline">{byline}</div>

        {/* Title — anchored bottom left, massive */}
        <div className="hero-v2-title-block">
          <h1 className="hero-v2-title">
            <span className="hero-v2-title-main">{titleMain}</span>
            <br />
            <span className="hero-v2-title-accent">{titleAccent}</span>
          </h1>
        </div>

        {/* Caption — bottom left, above dots */}
        {slides[activeIndex]?.caption && (
          <div className="hero-v2-caption">
            {slides[activeIndex].caption}
          </div>
        )}

        {/* Dots — bottom right */}
        {slides.length > 1 && (
          <div className="hero-v2-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero-v2-dot ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Intro strip — below the image ── */}
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
      </div>

    </section>
  );
}