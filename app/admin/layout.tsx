import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-card">
          <h1 className="admin-sidebar-title">Dashboard</h1>

          <nav className="admin-nav">
            <Link href="/admin">Posts</Link>
            <Link href="/admin/media">Media</Link>
            <Link href="/admin/insights">Insights</Link>
            <Link href="/admin/settings">Settings</Link>
          </nav>
        </div>
      </aside>

      <section className="admin-content">{children}</section>
    </main>
  );
}