"use client";

import { supabase } from "../lib/supabase";

export default function AdminSignOutButton() {
  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={signOut}>
      Sign Out
    </button>
  );
}