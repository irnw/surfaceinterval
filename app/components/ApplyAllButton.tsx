"use client";

import { useState } from "react";

export default function ApplyAllButton() {
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);

  async function handleApplyAll() {
    // Find every quick-edit form on the page
    const forms = Array.from(
      document.querySelectorAll<HTMLFormElement>("form[data-quick-edit]")
    );

    if (forms.length === 0) return;

    setApplying(true);
    setDone(false);

    // Submit each form sequentially so server actions don't collide
    for (const form of forms) {
      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        // Small delay to avoid hammering the server
        await new Promise((r) => setTimeout(r, 180));
      }
    }

    setApplying(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <button
      type="button"
      className="apt-apply-all-btn"
      onClick={handleApplyAll}
      disabled={applying}
      title="Apply all quick-edit changes on this page"
    >
      {applying ? "Applying…" : done ? "✓ All Applied" : "Apply All Changes"}
    </button>
  );
}