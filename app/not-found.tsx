import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { createSupabaseServerClient } from "./lib/supabase-server";

export default async function NotFoundPage() {
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
        <div className="empty-state-copy">
          <div className="post-meta">404</div>
          <h1 className="post-title">This page drifted out of view.</h1>
          <div className="post-standfirst">
            The story you were looking for is no longer here, or the link was
            never quite right to begin with.
          </div>

          <div className="empty-state-actions">
            <Link href="/" className="nav-pill">
              Back to Front Page
            </Link>
            <Link href="/archive" className="nav-pill">
              Browse Archive
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </>
  );
}