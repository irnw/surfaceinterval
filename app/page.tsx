export const revalidate = 0;

import type { Metadata } from "next";
import Header from "./components/Header";
import Hero from "./components/Hero";
import EditorialHome from "./components/EditorialHome";
import FeatureBand from "./components/FeatureBand";
import Stats from "./components/Stats";
import Footer from "./components/Footer";
import { createSupabaseServerClient } from "./lib/supabase-server";
import { getDisplayReadTime } from "./lib/read-time";

export const metadata: Metadata = {
  title: "Surface Interval",
  description: "Dive logs, travel, gear, and the quieter moments in between.",
  openGraph: {
    title: "Surface Interval",
    description: "Dive logs, travel, gear, and the quieter moments in between.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80",
        width: 1800,
        height: 1200,
        alt: "Surface Interval homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Surface Interval",
    description: "Dive logs, travel, gear, and the quieter moments in between.",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80",
    ],
  },
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const allPosts = (posts ?? []).map((post) => ({
    ...post,
    read_time: getDisplayReadTime(post.read_time, post.body),
  }));

  const featuredPost =
    allPosts.find((post) => post.is_featured) || null;

  const editorsPicks = allPosts
    .filter((post) => {
      if (!post.is_editors_pick) return false;
      if (featuredPost && post.slug === featuredPost.slug) return false;
      return true;
    })
    .sort((a, b) => {
      const aOrder = a.editors_pick_order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.editors_pick_order ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) return aOrder - bOrder;

      const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;

      return bDate - aDate;
    })
    .slice(0, 3);

  const latestDispatches = allPosts.slice(0, 3);

  return (
    <>
      <Header />
      <Hero settings={settings} />

      <EditorialHome
        posts={latestDispatches}
        settings={settings}
        editorsPicks={editorsPicks}
        featuredPost={featuredPost}
      />

      {featuredPost ? <FeatureBand featuredPost={featuredPost} /> : null}

      <Stats
        settings={settings}
        postCount={allPosts.length}
      />

      <Footer settings={settings} />
    </>
  );
}