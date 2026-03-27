"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setLocalError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
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
            Admin access is private. Enter your email to receive a secure sign-in link.
          </div>

          {error === "unauthorized" ? (
            <div className="login-error-box">
              This email is not authorized for dashboard access.
            </div>
          ) : null}

          {localError ? (
            <div className="login-error-box">{localError}</div>
          ) : null}

          {sent ? (
            <div className="editor-warning" style={{ maxWidth: 560, marginTop: 20 }}>
              Magic link sent. Open your email and use the sign-in link to continue.
            </div>
          ) : (
            <form onSubmit={signInWithMagicLink} className="login-form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}