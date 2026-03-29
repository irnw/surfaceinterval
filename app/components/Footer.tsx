import Link from "next/link";

type FooterSettings = {
  footer_left?: string | null;
  footer_right?: string | null;
};

export default function Footer({ settings }: { settings: FooterSettings | null }) {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-brand">Surface Interval</div>
        <div className="footer-copy">
          {settings?.footer_left || "Surface Interval – Irene W"}
        </div>
      </div>

      <div className="footer-links">
        <Link href="/about">About</Link>
        <Link href="/archive">Archive</Link>
        <Link href="/search">Search</Link>
        <a
          href="/rss.xml"
          className="footer-rss"
          title="Subscribe via RSS"
          target="_blank"
          rel="noopener noreferrer"
        >
          RSS
        </a>
      </div>

      <div className="footer-right">
        {/* "writing" is the discreet admin entry point — styled identically to surrounding text */}
        Modern editorial journal · photography-led long-form{" "}
        <Link href="/login" className="footer-admin-word">writing</Link>
      </div>
    </footer>
  );
}