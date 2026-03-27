export default function InsightsPage() {
  return (
    <>
      <div className="panel-head"><h2>Insights</h2></div>
      <div className="insights-grid">
        <div className="insight-card"><div className="insight-label">Unique Visitors</div><div className="insight-value">—</div></div>
        <div className="insight-card"><div className="insight-label">Returning Readers</div><div className="insight-value">—</div></div>
        <div className="insight-card"><div className="insight-label">Avg. Time on Page</div><div className="insight-value">—</div></div>
        <div className="insight-card"><div className="insight-label">Collab Clicks</div><div className="insight-value">—</div></div>
      </div>
    </>
  );
}
