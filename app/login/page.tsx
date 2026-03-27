"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const next = searchParams.get("next") || "/admin";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLocalError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
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

          <form onSubmit={signInWithPassword} className="login-form login-form-stack">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
        </div>
      </main>
    </>
  );
}