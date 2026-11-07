import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="Bazaarline home">
          <span className="brand__mark" aria-hidden />
          <span className="brand__name">Bazaarline</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <a href="#insight">Insight</a>
          <a href="#about-data">Data</a>
        </nav>
      </div>
    </header>
  );
}
