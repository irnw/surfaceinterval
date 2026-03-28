"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";

type Period = "day" | "week" | "month" | "3months" | "6months" | "9months" | "year";

const PERIODS: { value: Period; label: string }[] = [
  { value: "day",      label: "Today" },
  { value: "week",     label: "7 days" },
  { value: "month",    label: "30 days" },
  { value: "3months",  label: "3 months" },
  { value: "6months",  label: "6 months" },
  { value: "9months",  label: "9 months" },
  { value: "year",     label: "1 year" },
];

const PLATFORMS = ["x", "instagram", "whatsapp", "linkedin", "email"];
const PLATFORM_LABELS: Record<string, string> = {
  x: "X (Twitter)", instagram: "Instagram", whatsapp: "WhatsApp",
  linkedin: "LinkedIn", email: "Email",
};

function periodToDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "day":      return new Date(now.getTime() - 86400000);
    case "week":     return new Date(now.getTime() - 7 * 86400000);
    case "month":    return new Date(now.getTime() - 30 * 86400000);
    case "3months":  return new Date(now.getTime() - 90 * 86400000);
    case "6months":  return new Date(now.getTime() - 180 * 86400000);
    case "9months":  return new Date(now.getTime() - 270 * 86400000);
    case "year":     return new Date(now.getTime() - 365 * 86400000);
  }
}

interface ShareRow { slug: string; platform: string; shared_at: string; }

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [allShares, setAllShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("share_events")
        .select("slug, platform, shared_at")
        .order("shared_at", { ascending: false });
      setAllShares(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const cutoff = periodToDate(period);
  const filtered = allShares.filter((r) => new Date(r.shared_at) >= cutoff);

  const platformCounts: Record<string, number> = {};
  for (const row of filtered) {
    platformCounts[row.platform] = (platformCounts[row.platform] ?? 0) + 1;
  }
  const totalShares = filtered.length;

  const postCounts: Record<string, number> = {};
  for (const row of filtered) {
    postCounts[row.slug] = (postCounts[row.slug] ?? 0) + 1;
  }
  const topPosts = Object.entries(postCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  const topPlatform = PLATFORMS.reduce((best, p) =>
    (platformCounts[p] ?? 0) > (platformCounts[best] ?? 0) ? p : best, PLATFORMS[0]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Insights</h2>
          <p>Share tracking is live. Visitor analytics connect once the site is deployed.</p>
        </div>
      </div>

      <div className="ins-period-bar">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`ins-period-btn ${period === p.value ? "ins-period-btn--active" : ""}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="ins-cards">
        <div className="ins-card">
          <div className="ins-card-label">Total Shares</div>
          <div className="ins-card-value">{loading ? "—" : totalShares > 0 ? totalShares : "0"}</div>
          <div className="ins-card-sub">across all platforms</div>
        </div>
        <div className="ins-card">
          <div className="ins-card-label">Top Platform</div>
          <div className="ins-card-value">
            {loading ? "—" : totalShares > 0 ? PLATFORM_LABELS[topPlatform] : "—"}
          </div>
          <div className="ins-card-sub">
            {totalShares > 0 ? `${platformCounts[topPlatform] ?? 0} shares` : "no data yet"}
          </div>
        </div>
        <div className="ins-card">
          <div className="ins-card-label">Unique Visitors</div>
          <div className="ins-card-value">—</div>
          <div className="ins-card-sub">connect Google Analytics</div>
        </div>
        <div className="ins-card">
          <div className="ins-card-label">Avg. Time on Page</div>
          <div className="ins-card-value">—</div>
          <div className="ins-card-sub">connect Google Analytics</div>
        </div>
      </div>

      <div className="ins-body">
        <div className="ins-section">
          <div className="ins-section-head">
            <div className="ins-section-label">Shares by platform</div>
          </div>
          {loading ? (
            <div className="ins-loading">Loading…</div>
          ) : totalShares === 0 ? (
            <div className="ins-empty">No shares recorded in this period.</div>
          ) : (
            <div className="ins-platform-list">
              {PLATFORMS.map((p) => {
                const count = platformCounts[p] ?? 0;
                const pct = totalShares > 0 ? Math.round((count / totalShares) * 100) : 0;
                return (
                  <div key={p} className="ins-platform-row">
                    <span className="ins-platform-name">{PLATFORM_LABELS[p]}</span>
                    <div className="ins-bar-wrap">
                      <div className="ins-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="ins-platform-count">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ins-section">
          <div className="ins-section-head">
            <div className="ins-section-label">Most shared posts</div>
          </div>
          {loading ? (
            <div className="ins-loading">Loading…</div>
          ) : topPosts.length === 0 ? (
            <div className="ins-empty">No shares recorded in this period.</div>
          ) : (
            <div className="ins-post-list">
              {topPosts.map(([slug, count], i) => (
                <div key={slug} className="ins-post-row">
                  <span className="ins-post-rank">{i + 1}</span>
                  <a href={`/posts/${slug}`} target="_blank" rel="noopener noreferrer" className="ins-post-slug">
                    /posts/{slug}
                  </a>
                  <span className="ins-post-count">{count} {count === 1 ? "share" : "shares"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}