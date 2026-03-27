import { createDashboardUser } from "../actions";
import { supabaseAdmin } from "../../lib/supabase-admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Users</h2>
          <p>Create dashboard users and review existing auth users.</p>
        </div>
      </div>

      {params.created ? <div className="admin-banner">User created.</div> : null}

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">Add User</h3>

        <form action={createDashboardUser} className="admin-settings-grid">
          <div className="admin-setting">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>

          <div className="admin-setting">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>

          <div className="admin-settings-actions">
            <button type="submit">Create User</button>
          </div>
        </form>
      </div>

      <div className="admin-settings-section">
        <h3 className="admin-settings-title">Existing Users</h3>

        <div className="admin-user-list">
          {data?.users?.map((user) => (
            <div key={user.id} className="admin-user-row">
              <div>
                <div className="admin-post-title">{user.email || "No email"}</div>
                <div className="admin-post-slug">{user.id}</div>
              </div>

              <div className="admin-muted-cell">
                {user.email_confirmed_at ? "Confirmed" : "Unconfirmed"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}