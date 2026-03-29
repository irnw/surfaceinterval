export const revalidate = 0;

import type { Metadata } from "next";
import Header from "./components/Header";
import Hero from "./components/Hero";
import EditorialHome from "./components/EditorialHome";
import Stats from "./components/Stats";
import OnTheShelf from "./components/OnTheShelf";
import Footer from "./components/Footer";
import { createSupabaseServerClient } from "./lib/supabase-server";
import { getDisplayReadTime } from "./lib/read-time";

export const metadata: Metadata = {
  title: "Surface Interval",
  description: "Dive logs, long-form travel, gear worth writing about, and the quieter moments in between.",
  openGraph: {
    title: "Surface Interval",
    description: "Dive logs, long-form travel, gear worth writing about, and the quieter moments in between.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surface Interval",
    description: "Dive logs, long-form travel, gear worth writing about, and the quieter moments in between.",
  },
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (postsError) console.error("Homepage posts error:", postsError.message);

  const allPosts = (posts ?? []).map((post) => ({
    ...post,
    read_time: getDisplayReadTime(post.read_time, post.body),
  }));

  // Featured post — is_featured flag
  const featuredPost = allPosts.find((p) => p.is_featured) || null;

  // Editor's picks — up to 3, exclude featured
  const editorsPicks = allPosts
    .filter((p) => {
      if (!p.is_editors_pick) return false;
      if (featuredPost && p.slug === featuredPost.slug) return false;
      return true;
    })
    .sort((a, b) => {
      const aO = a.editors_pick_order ?? Number.MAX_SAFE_INTEGER;
      const bO = b.editors_pick_order ?? Number.MAX_SAFE_INTEGER;
      if (aO !== bO) return aO - bO;
      return (b.published_at ? new Date(b.published_at).getTime() : 0)
           - (a.published_at ? new Date(a.published_at).getTime() : 0);
    })
    .slice(0, 3);

  // Grid posts — latest 5 (featured post will be excluded inside EditorialHome)
  const latestPosts = allPosts.slice(0, 5);

  const readingShelf = Array.isArray(settings?.reading_shelf)
    ? settings.reading_shelf.slice(0, 6)
    : [];

  return (
    <>
      <Header />
      <Hero settings={settings} />

      {/* Featured hero + 2-col grid — FeatureBand component removed */}
      <EditorialHome
        posts={latestPosts}
        settings={settings}
        editorsPicks={editorsPicks}
        featuredPost={featuredPost}
      />

      {/* Stats · Shelf · Footer */}
      <Stats settings={settings} postCount={allPosts.length} />
      <OnTheShelf books={readingShelf} />
      <Footer settings={settings} />
    </>
  );
}