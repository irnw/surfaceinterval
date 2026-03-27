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
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const paragraphs = String(settings?.about_body || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Header />

      <main className="post-shell">
        <div className="post-head">
          <div className="post-meta">About</div>
          <h1 className="post-title">
            {settings?.about_title || "Editorial · Brand · Creative"}
          </h1>
          <div className="post-standfirst">
            {settings?.about_intro ||
              "Surface Interval is a writing and image-led journal about diving, travel, gear, and the quieter observations that stay with you after the trip is over."}
          </div>
        </div>

        <article className="prose">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      </main>

      <Footer settings={settings} />
    </>
  );
}