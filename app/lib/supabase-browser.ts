// app/lib/supabase-browser.ts
// Use this instead of supabase.ts in client components that need auth context
// (e.g. MediaLibrary, ShareButtons, InsightsPage)
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}