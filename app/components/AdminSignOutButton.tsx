"use client";

export default function AdminSignOutButton() {
  async function signOut() {
    await fetch("/api/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={signOut}>
      Sign Out
    </button>
  );
}