export const revalidate = 0;

import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";

export const metadata: Metadata = {
  title: "Contact",
  description: "Editorial, brand, and creative contact details for Surface Interval.",
  openGraph: {
    title: "Contact · Surface Interval",
    description: "Editorial, brand, and creative contact details for Surface Interval.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact · Surface Interval",
    description: "Editorial, brand, and creative contact details for Surface Interval.",
  },
};

export default async function ContactPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  const paragraphs = String(settings?.contact_body || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Header />

      <main className="post-shell">
        <div className="post-head">
          <div className="post-meta">Contact</div>
          <h1 className="post-title">
            {settings?.contact_title || "Contact"}
          </h1>
          <div className="post-standfirst">
            {settings?.contact_intro ||
              "For editorial, brand, and creative enquiries, get in touch."}
          </div>
        </div>

        <article className="prose">
          {settings?.contact_email ? (
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${settings.contact_email}`}>
                {settings.contact_email}
              </a>
            </p>
          ) : null}

          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      </main>

      <Footer settings={settings} />
    </>
  );
}