interface Settings {
  dives_logged?: string;
  countries_reached?: string;
}

interface StatsProps {
  settings: Settings | null;
  postCount: number;
}

export default function Stats({ settings, postCount }: StatsProps) {
  const divesLogged = settings?.dives_logged || "500+";
  const countriesReached = settings?.countries_reached || "40+";

  return (
    <section className="stats">
      <div className="stats-grid stats-grid--three">
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
      </div>
    </section>
  );
}