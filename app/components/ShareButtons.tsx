"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ShareButtonsProps {
  title: string;
  slug: string;
  position: "top" | "bottom";
}

const PLATFORMS = [
  { id: "x",         label: "X"         },
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp",  label: "WhatsApp"  },
  { id: "linkedin",  label: "LinkedIn"  },
  { id: "email",     label: "Email"     },
] as const;

type Platform = (typeof PLATFORMS)[number]["id"];

function buildShareUrl(platform: Platform, url: string, title: string): string {
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);
  switch (platform) {
    case "x":         return `https://x.com/intent/tweet?text=${encTitle}&url=${enc}`;
    case "whatsapp":  return `https://wa.me/?text=${encTitle}%20${enc}`;
    case "linkedin":  return `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;
    case "email":     return `mailto:?subject=${encTitle}&body=I thought you might enjoy this: ${enc}`;
    case "instagram": return ""; // no web share URL — copy to clipboard instead
  }
}

async function trackShare(slug: string, platform: string) {
  try {
    await supabase.from("share_events").insert({ slug, platform, shared_at: new Date().toISOString() });
  } catch { /* non-critical */ }
}

export default function ShareButtons({ title, slug, position }: ShareButtonsProps) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setPageUrl(window.location.href); }, []);

  async function handleShare(platform: Platform) {
    await trackShare(slug, platform);

    if (platform === "instagram") {
      await navigator.clipboard.writeText(pageUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const shareUrl = buildShareUrl(platform, pageUrl, title);
    if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`share-strip share-strip--${position}`}>
      <span className="share-label">Share</span>
      <div className="share-buttons">
        {PLATFORMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`share-btn share-btn--${id}`}
            onClick={() => handleShare(id)}
            title={id === "instagram" ? "Copy link (paste into Instagram)" : `Share on ${label}`}
          >
            {id === "instagram" && copied ? "Copied!" : label}
          </button>
        ))}
      </div>
    </div>
  );
}