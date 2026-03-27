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
    .eq("id", 1)
    .single();

  return (
    <>
      <Header />

      <main className="post-shell">
        <div className="post-head">
          <div className="post-meta">About</div>
          <h1 className="post-title">Editorial · Brand · Creative</h1>
          <div className="post-standfirst">
            Surface Interval is a writing and image-led journal about diving,
            travel, gear, and the quieter observations that stay with you after
            the trip is over.
          </div>
        </div>

        <article className="prose">
          <p>
            It began as a way to return to writing with more patience: not to
            post faster, but to notice more carefully. Some stories come from
            the water, some from the road, and some from the pause in between.
          </p>

          <p>
            The journal is shaped by a simple editorial instinct — clarity over
            noise, mood over volume, and detail over performance. It is meant to
            feel calm before it feels clever.
          </p>

          <p>
            I am open to selected collaborations across editorial work, travel
            and diving features, gear storytelling, and brand or creative
            partnerships that fit the tone of the site.
          </p>

          <p>
            For collaborations or editorial conversations, you can adapt this
            page later with your preferred contact details or social links.
          </p>
        </article>
      </main>

      <Footer settings={settings} />
    </>
  );
}