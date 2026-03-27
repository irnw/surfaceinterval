import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import AdminSignOutButton from "../components/AdminSignOutButton";
import { createSupabaseServerClient } from "../lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  if (!user) {
    redirect("/login");
  }

  if (allowedEmail && user.email?.toLowerCase() !== allowedEmail) {
    redirect("/login?error=unauthorized");
  }

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
              <Link href="/admin/users">Users</Link>
            </nav>
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-topbar">
            <div className="admin-topbar-left">
              <Link href="/" className="nav-pill">
                ← Homepage
              </Link>

              <Link href="/admin/new" className="nav-pill">
                + New Post
              </Link>
            </div>

            <div className="admin-topbar-right">
              <div className="admin-user-chip">{user.email}</div>
              <AdminSignOutButton />
            </div>
          </div>

          {children}
        </section>
      </main>
    </>
  );
}