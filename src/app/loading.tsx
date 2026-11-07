export default function Loading() {
  return (
    <main className="page-shell">
      <p className="hero-brand">Bazaarline</p>
      <p className="hero-kicker">Loading India market drawdowns…</p>
      <div className="stat-strip" aria-busy="true">
        <div className="stat-strip__grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-strip__item">
              <p className="stat-strip__label">Updating</p>
              <p className="stat-strip__value">—</p>
              <p className="stat-strip__hint">Fetching Yahoo Finance closes</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
