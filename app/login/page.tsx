"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const error = searchParams.get("error");
  const mode = searchParams.get("mode");

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [message, setMessage] = useState("");

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setLocalError(data.error || "Sign in failed.");
      setLoading(false);
      return;
    }

    window.location.href = next;
  }

  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/login?mode=recovery`,
    });

    if (error) {
      setLocalError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset email sent.");
    setLoading(false);
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setLocalError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated. You can now sign in with your new password.");
    setLoading(false);
  }

  return (
    <>
      <Header />

      <main className="post-shell">
        <div className="post-head">
          <div className="post-meta">Dashboard Access</div>
          <h1 className="post-title">Sign in</h1>
          <div className="post-standfirst">
            Admin access is private. Sign in with your email and password.
          </div>

          {error === "unauthorized" ? (
            <div className="login-error-box">
              This email is not authorized for dashboard access.
            </div>
          ) : null}

          {localError ? (
            <div className="login-error-box">{localError}</div>
          ) : null}

          {message ? (
            <div className="editor-warning" style={{ maxWidth: 560, marginTop: 20 }}>
              {message}
            </div>
          ) : null}

          {mode === "recovery" ? (
            <form onSubmit={updatePassword} className="login-form login-form-stack">
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={signInWithPassword} className="login-form login-form-stack">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <form
                onSubmit={sendResetEmail}
                className="login-form login-form-stack"
                style={{ marginTop: 18 }}
              >
                <input
                  type="email"
                  placeholder="Reset password for this email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Password Reset"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}