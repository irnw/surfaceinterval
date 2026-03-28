interface Settings {
  dives_logged?: string;
  countries_reached?: string;
  available_for?: string;
  availability_description?: string;
}

interface StatsProps {
  settings: Settings | null;
  postCount: number;
}

export default function Stats({ settings, postCount }: StatsProps) {
  const divesLogged = settings?.dives_logged || "500+";
  const countriesReached = settings?.countries_reached || "40+";
  const availableFor = settings?.available_for || "Editorial · Brand · Creative";
  const availabilityDescription = settings?.availability_description || "Open to selected collaborations and thoughtful partnerships";

  const availableItems = availableFor.split(/[·•,]/).map((s) => s.trim()).filter(Boolean);

  return (
    <section className="stats">
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">Dispatches Published</div>
          <div className="stat-value">{postCount}</div>
          <div className="stat-sub">A growing archive of field notes and essays</div>
        </div>
        <div className="stat">
          <div className="stat-label">Dives Logged</div>
          <div className="stat-value">{divesLogged}</div>
          <div className="stat-sub">Since 2015</div>
        </div>
        <div className="stat">
          <div className="stat-label">Countries Reached</div>
          <div className="stat-value">{countriesReached}</div>
          <div className="stat-sub">Across land, sea, and a few repeat returns</div>
        </div>
        <div className="stat">
          <div className="stat-label">Available For</div>
          <div className="stat-value stat-links">
            {availableItems.map((item, i) => (
              <span key={item}>
                <a href="/about">{item}</a>
                {i < availableItems.length - 1 && <span style={{ margin: "0 4px", color: "var(--muted-2)" }}>·</span>}
              </span>
            ))}
          </div>
          <div className="stat-sub">{availabilityDescription}</div>
        </div>
      </div>
    </section>
  );
}