"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80",
    caption: "Addu Atoll, Maldives · March 2026",
  },
  {
    image:
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1800&q=80",
    caption: "Blue water descent · Indian Ocean",
  },
  {
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1800&q=80",
    caption: "Quiet coastal light · Red Sea",
  },
];

type Settings = {
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_description?: string | null;
  hero_tags?: string | null;
};

function tagHref(tag: string) {
  const normalized = tag.trim().toLowerCase();

  if (normalized === "diving") return "/category/diving";
  if (normalized === "travel") return "/category/travel";
  if (normalized === "gear") return "/category/gear";
  if (normalized === "personal") return "/category/personal";

  return `/tags/${encodeURIComponent(tag.trim())}`;
}

export default function Hero({ settings }: { settings: Settings | null }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4800);

    return () => clearInterval(t);
  }, []);

  const title = settings?.hero_title || "Surface Interval";
  const words = title.split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ");

  const tags = (settings?.hero_tags || "Diving,Travel,Gear,Personal")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <section className="hero">
      <div className="hero-layout">
        <div className="hero-media">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`hero-slide${i === active ? " is-active" : ""}`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
          ))}

          <div className="hero-caption">{slides[active].caption}</div>

          <div className="hero-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`hero-dot${i === active ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="hero-copy-col">
          <div className="hero-line">
            {settings?.hero_eyebrow || "Travel · Ocean · Photography · Life"}
          </div>

          <h1 className="hero-title">
            <span className="hero-title-main">{first}</span>{" "}
            <span className="hero-accent">{rest}</span>
          </h1>

          <div className="hero-byline">
            {settings?.hero_subtitle || "By Irene W"}
          </div>

          <div className="hero-copy">
            <div className="hero-copy-strong">
              A journal from the deep end of the world.
            </div>
            <div className="hero-copy-soft">
              {settings?.hero_description ||
                "Dive logs, travel, gear, and the quieter moments in between."}
            </div>
          </div>

          <div className="hero-tags">
            {tags.map((tag) => (
              <Link key={tag} href={tagHref(tag)} className="hero-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}