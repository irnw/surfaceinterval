export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { getDisplayReadTime } from "../lib/read-time";

type ArchivePost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  read_time?: string | null;
  published_at?: string | null;
  body?: unknown;
  tags?: string[] | null;
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
  return new Date(post.published_at).toLocaleDateString("en-GB", {
    month: "long",
  });
}

function sortYearsDesc(yearA: string, yearB: string) {
  if (yearA === "Undated") return 1;
  if (yearB === "Undated") return -1;
  return Number(yearB) - Number(yearA);
}

function monthOrder(month: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const allPosts = (rawPosts ?? []).map((post) => ({
    ...post,
    read_time: getDisplayReadTime(post.read_time, post.body),
  })) as ArchivePost[];

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

      <section className="archive-shell">
        <div className="archive-head">
          <div className="archive-label">Archive</div>
          <h1 className="archive-title">All Dispatches</h1>
        </div>

        <div className="archive-index">
          {years.map((year) => {
            const months = Object.keys(grouped[year]).sort(sortMonthsDesc);

            return (
              <section key={year} className="archive-year-block">
                <h2 className="archive-year">{year}</h2>

                <div className="archive-months">
                  {months.map((month) => (
                    <div key={`${year}-${month}`} className="archive-month-block">
                      <h3 className="archive-month">{month}</h3>

                      <div className="archive-list">
                        {grouped[year][month].map((post) => (
                          <article key={post.id} className="archive-row">
                            <div className="archive-row-main">
                              <div className="archive-row-kicker">
                                {post.category}
                              </div>

                              <h4 className="archive-row-title">
                                <Link href={`/posts/${post.slug}`}>
                                  {post.title}
                                </Link>
                              </h4>

                              <div className="archive-row-desc">
                                {post.excerpt}
                              </div>

                              {post.tags?.length ? (
                                <div className="post-tags" style={{ marginTop: 14 }}>
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
                                  ? new Date(post.published_at).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "Undated"}
                              </div>
                              <div>{post.read_time}</div>
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