import Link from "next/link";

type FooterSettings = {
  footer_left?: string | null;
  footer_right?: string | null;
};

export default function Footer({
  settings,
}: {
  settings: FooterSettings | null;
}) {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-brand">Surface Interval</div>
        <div className="footer-copy">
          {settings?.footer_left || "Editorial · Brand · Creative"}
        </div>
      </div>

      <div className="footer-links">
        <Link href="/about">About</Link>
        <Link href="/archive">Archive</Link>
        <Link href="/search">Search</Link>
      </div>

      <div className="footer-right">
        {settings?.footer_right || "© 2026 Surface Interval"}
      </div>
    </footer>
  );
}