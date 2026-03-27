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
      ? settings.hero_slides
      : [];

    return rawSlides
      .filter(
        (item: any) =>
          item &&
          typeof item.image === "string" &&
          item.image.trim().length > 0
      )
      .slice(0, 5)
      .map((item: any) => ({
        image: item.image,
        caption: item.caption || "",
      }));
  }, [settings]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero">
      <div className="hero-layout">
        <div className="hero-media">
          {slides.length > 0 ? (
            <>
              {slides.map((slide, index) => (
                <div
                  key={`${slide.image}-${index}`}
                  className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              ))}

              {slides[activeIndex]?.caption ? (
                <div className="hero-caption">{slides[activeIndex].caption}</div>
              ) : null}

              {slides.length > 1 ? (
                <div className="hero-dots">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`hero-dot ${index === activeIndex ? "is-active" : ""}`}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="hero-placeholder" />
          )}
        </div>

        <div className="hero-copy-col">
          <div className="hero-line">
            {settings?.hero_eyebrow || "Travel · Ocean · Photography · Life"}
          </div>

          <h1 className="hero-title">
            <span className="hero-title-main">
              {settings?.hero_title_main || "Surface"}
            </span>{" "}
            <span className="hero-accent">
              {settings?.hero_title_accent || "Interval"}
            </span>
          </h1>

          <div className="hero-byline">{settings?.hero_byline || "By Irene W"}</div>

          <div className="hero-copy">
            <div className="hero-copy-strong">
              {settings?.hero_copy_strong || "A journal from the deep end of the world."}
            </div>

            <div className="hero-copy-soft">
              {settings?.hero_copy_soft ||
                "Dive logs, travel, gear, and the quieter moments in between."}
            </div>
          </div>

          <div className="hero-tags">
            <Link href="/category/diving" className="hero-tag">
              Diving
            </Link>
            <Link href="/category/travel" className="hero-tag">
              Travel
            </Link>
            <Link href="/category/gear" className="hero-tag">
              Gear
            </Link>
            <Link href="/category/personal" className="hero-tag">
              Personal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}