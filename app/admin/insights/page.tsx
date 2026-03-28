import { createSupabaseServerClient } from "../../lib/supabase-server";

export default async function InsightsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: sharesByPlatform } = await supabase.from("share_events").select("platform");
  const platformCounts: Record<string, number> = {};
  for (const row of sharesByPlatform ?? []) {
    platformCounts[row.platform] = (platformCounts[row.platform] ?? 0) + 1;
  }
  const totalShares = Object.values(platformCounts).reduce((a, b) => a + b, 0);

  const { data: sharesByPost } = await supabase.from("share_events").select("slug");
  const postCounts: Record<string, number> = {};
  for (const row of sharesByPost ?? []) {
    postCounts[row.slug] = (postCounts[row.slug] ?? 0) + 1;
  }
  const topPosts = Object.entries(postCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  const platforms = ["x", "instagram", "whatsapp", "linkedin", "email"];
  const platformLabels: Record<string, string> = {
    x: "X (Twitter)", instagram: "Instagram", whatsapp: "WhatsApp",
    linkedin: "LinkedIn", email: "Email",
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Insights</h2>
          <p>Analytics connect here once your site is live. Share tracking is active.</p>
        </div>
      </div>

      <div className="insights-grid" style={{ marginBottom: 32 }}>
        <div className="insight-card">
          <div className="insight-label">Unique Visitors</div>
          <div className="insight-value">—</div>
          <div className="insight-note">Connect Google Analytics</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Returning Readers</div>
          <div className="insight-value">—</div>
          <div className="insight-note">Connect Google Analytics</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Avg. Time on Page</div>
          <div className="insight-value">—</div>
          <div className="insight-note">Connect Google Analytics</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Total Shares</div>
          <div className="insight-value">{totalShares > 0 ? totalShares : "—"}</div>
          <div className="insight-note">Tracked via share buttons</div>
        </div>
      </div>

      <div className="insights-section">
        <div className="insights-section-label">Shares by platform</div>
        <table className="insights-table">
          <thead><tr><th>Platform</th><th>Shares</th></tr></thead>
          <tbody>
            {platforms.map((p) => (
              <tr key={p}>
                <td>{platformLabels[p]}</td>
                <td>{platformCounts[p] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topPosts.length > 0 && (
        <div className="insights-section" style={{ marginTop: 28 }}>
          <div className="insights-section-label">Most shared posts</div>
          <table className="insights-table">
            <thead><tr><th>Post</th><th>Shares</th></tr></thead>
            <tbody>
              {topPosts.map(([slug, count]) => (
                <tr key={slug}>
                  <td>
                    <a href={`/posts/${slug}`} target="_blank"
                      style={{ color: "var(--purple-deep)", textDecoration: "none" }}>
                      /posts/{slug}
                    </a>
                  </td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}