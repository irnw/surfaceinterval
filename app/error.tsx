"use client";

import Link from "next/link";
import Header from "./components/Header";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <>
      <Header />

      <main className="post-shell">
        <div className="post-head">
          <div className="post-meta">Error</div>
          <h1 className="post-title">Something broke mid-page.</h1>
          <div className="post-standfirst">
            The page failed to load properly. Try again, or go back to the front page.
          </div>
        </div>

        <div className="empty-state-actions">
          <button type="button" onClick={reset}>
            Try Again
          </button>

          <Link href="/" className="nav-pill">
            Front Page
          </Link>
        </div>
      </main>
    </>
  );
}