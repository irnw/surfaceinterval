"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { createBrowserClient } from "@supabase/ssr";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(pathname: string, href: string) {
  return isActive(pathname, href) ? "nav-link is-active" : "nav-link";
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data: { session } }) => setIsSignedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsSignedIn(!!session)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className={`masthead ${isHome ? "masthead-home" : "masthead-inner-page"}`}>
      <div className="masthead-inner">
        <div className={`brand ${isHome ? "brand-home" : "brand-inner"}`}>
          <Link href="/">
            {isHome ? (
              <div className="brand-title brand-title--home-subtle">SI</div>
            ) : (
              <div className="brand-title">Surface Interval</div>
            )}
          </Link>
          {!isHome && <div className="brand-sub">By Irene W</div>}
        </div>

        <div className="masthead-right">
          <nav className="nav">
            <Link href="/" className={navLinkClass(pathname, "/")}>Home</Link>
            <Link href="/category/diving" className={navLinkClass(pathname, "/category/diving")}>Diving</Link>
            <Link href="/category/travel" className={navLinkClass(pathname, "/category/travel")}>Travel</Link>
            <Link href="/category/gear" className={navLinkClass(pathname, "/category/gear")}>Gear</Link>
            <Link href="/category/personal" className={navLinkClass(pathname, "/category/personal")}>Personal</Link>
            <Link href="/archive" className={navLinkClass(pathname, "/archive")}>Archive</Link>
            <Link href="/about" className={navLinkClass(pathname, "/about")}>About</Link>

            <button
              type="button"
              className={`search-toggle ${pathname === "/search" ? "is-active" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Search"
            >
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <ThemeToggle />

            {isSignedIn && (
              <Link href="/admin" className={`nav-pill ${pathname.startsWith("/admin") ? "is-active" : ""}`}>
                Dashboard
              </Link>
            )}
          </nav>

          {open && (
            <form action="/search" method="GET" className="masthead-search">
              <input type="text" name="q" placeholder="Search the archive" autoFocus />
              <button type="submit">Go</button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}