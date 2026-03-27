"use client";

import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminSignOutButton() {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut}>
      Sign Out
    </button>
  );
}