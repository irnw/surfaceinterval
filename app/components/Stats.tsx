import Link from "next/link";

type Settings = {
  dives_logged?: string | null;
  countries_reached?: string | null;
  available_for?: string | null;
};

export default function Stats({
  settings,
  postCount,
}: {
  settings: Settings | null;
  postCount: number;
}) {
  return (
    <section className="stats">
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">Dispatches Published</div>
          <div className="stat-value">{postCount}</div>
          <div className="stat-sub">
            A growing archive of field notes and essays
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Dives Logged</div>
          <div className="stat-value">{settings?.dives_logged ?? "500+"}</div>
          <div className="stat-sub">Updated as new trips accumulate</div>
        </div>

        <div className="stat">
          <div className="stat-label">Countries Reached</div>
          <div className="stat-value">
            {settings?.countries_reached ?? "40+"}
          </div>
          <div className="stat-sub">Across land, sea, and repeat returns</div>
        </div>

        <div className="stat">
          <div className="stat-label">Available For</div>

          <div className="stat-links">
            <Link href="/contact">Editorial</Link>
            <span>·</span>
            <Link href="/contact">Brand</Link>
            <span>·</span>
            <Link href="/contact">Creative</Link>
          </div>

          <div className="stat-sub">
            Open to selected collaborations and thoughtful partnerships
          </div>
        </div>
      </div>
    </section>
  );
}