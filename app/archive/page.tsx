export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";

type ArchivePost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  read_time?: string | null;
  published_at?: string | null;
  tags?: string[] | null;
  series?: string | null;
  location?: string | null;
};

type GroupedArchive = Record<string, Record<string, ArchivePost[]>>;

export const metadata: Metadata = {
  title: "Archive",
  description: "The published archive of Surface Interval.",
  openGraph: {
    title: "Archive · Surface Interval",
    description: "The published archive of Surface Interval.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive · Surface Interval",
    description: "The published archive of Surface Interval.",
  },
};

function getYear(post: ArchivePost) {
  if (!post.published_at) return "Undated";
  return new Date(post.published_at).getFullYear().toString();
}

function getMonth(post: ArchivePost) {
  if (!post.published_at) return "Undated";
  return new Date(post.published_at).toLocaleDateString("en-GB", { month: "long" });
}

function sortYearsDesc(yearA: string, yearB: string) {
  if (yearA === "Undated") return 1;
  if (yearB === "Undated") return -1;
  return Number(yearB) - Number(yearA);
}

function monthOrder(month: string) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const index = months.indexOf(month);
  return index === -1 ? 999 : index;
}

function sortMonthsDesc(monthA: string, monthB: string) {
  if (monthA === "Undated") return 1;
  if (monthB === "Undated") return -1;
  return monthOrder(monthB) - monthOrder(monthA);
}

export default async function ArchivePage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings").select("*")
    .order("id", { ascending: true }).limit(1).maybeSingle();

  const { data: rawPosts } = await supabase
    .from("posts").select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const allPosts = (rawPosts ?? []) as ArchivePost[];

  const grouped: GroupedArchive = allPosts.reduce((acc, post) => {
    const year = getYear(post);
    const month = getMonth(post);
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(post);
    return acc;
  }, {} as GroupedArchive);

  const years = Object.keys(grouped).sort(sortYearsDesc);

  return (
    <>
      <Header />

      <section className="archive-shell archive-shell-editorial">
        <div className="archive-head">
          <div className="archive-label">Archive</div>
          <h1 className="archive-title">All Dispatches</h1>
          <div className="archive-intro">
            A running index of essays, travel notes, gear reflections, field observations,
            and underwater returns gathered over time.
          </div>
        </div>

        <div className="archive-index">
          {years.map((year) => {
            const months = Object.keys(grouped[year]).sort(sortMonthsDesc);
            return (
              <section key={year} className="archive-year-block">
                <div className="archive-year-rail">
                  <h2 className="archive-year">{year}</h2>
                  <div className="archive-year-count">
                    {Object.values(grouped[year]).flat().length} post
                    {Object.values(grouped[year]).flat().length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="archive-months">
                  {months.map((month) => (
                    <div key={`${year}-${month}`} className="archive-month-block">
                      <h3 className="archive-month">{month}</h3>

                      <div className="archive-list">
                        {grouped[year][month].map((post) => (
                          <article key={post.id} className="archive-row">
                            <div className="archive-row-main">

                              {/* Kicker row — category + series */}
                              <div className="archive-row-kicker-row">
                                <span className="archive-row-kicker">{post.category}</span>
                                {post.series && (
                                  <>
                                    <span className="archive-row-kicker-sep">·</span>
                                    <span className="archive-row-series">{post.series}</span>
                                  </>
                                )}
                              </div>

                              <h4 className="archive-row-title">
                                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                              </h4>

                              <div className="archive-row-desc">{post.excerpt}</div>

                              {/* Location */}
                              {post.location && (
                                <div className="archive-row-location">
                                  {post.location}
                                </div>
                              )}

                              {post.tags?.length ? (
                                <div className="post-tags" style={{ marginTop: 12 }}>
                                  {post.tags.map((tag) => (
                                    <Link
                                      key={tag}
                                      href={`/tags/${encodeURIComponent(tag)}`}
                                      className="tag"
                                    >
                                      #{tag}
                                    </Link>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            <div className="archive-row-meta">
                              <div>
                                {post.published_at
                                  ? new Date(post.published_at).toLocaleDateString("en-GB", {
                                      day: "2-digit", month: "short", year: "numeric",
                                    })
                                  : "Undated"}
                              </div>
                              <div>{post.read_time ?? "8 min read"}</div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <Footer settings={settings} />
    </>
  );
}