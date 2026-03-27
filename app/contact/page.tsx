import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";

export default async function ContactPage() {
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
          <div className="post-meta">Surface Interval</div>

          <h1 className="post-title">Editorial · Brand · Creative</h1>

          <div className="post-standfirst">
            For collaborations, editorial features, or creative work, feel free
            to reach out.
          </div>
        </div>

        <article className="prose">
          <p>
            Surface Interval is an independent journal focused on diving,
            travel, photography, and the quieter moments in between.
          </p>

          <p>I am open to selected collaborations related to:</p>

          <ul>
            <li>Editorial features</li>
            <li>Brand partnerships</li>
            <li>Diving and travel projects</li>
            <li>Photography commissions</li>
            <li>Creative collaborations</li>
          </ul>

          <p>
            Email:
            <br />
            <strong>your@email.com</strong>
          </p>

          <p>
            Instagram:
            <br />
            <strong>@irn.w</strong>
          </p>
        </article>
      </main>

      <Footer settings={settings} />
    </>
  );
}