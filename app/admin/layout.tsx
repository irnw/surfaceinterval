import type { ReactNode } from "react";
import Link from "next/link";
import Header from "../components/Header";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-card">
            <h3 className="admin-sidebar-title">Dashboard</h3>

            <nav className="admin-nav">
              <Link href="/admin">Posts</Link>
              <Link href="/admin/media">Media</Link>
              <Link href="/admin/insights">Insights</Link>
              <Link href="/admin/settings">Settings</Link>
            </nav>
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-topbar">
            <Link href="/" className="nav-pill">
              ← Homepage
            </Link>

            <Link href="/admin/new" className="nav-pill">
              + New Post
            </Link>
          </div>

          {children}
        </section>
      </main>
    </>
  );
}