import { createSupabaseServerClient } from "../../lib/supabase-server";
import SettingsClientPage from "./SettingsClientPage";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <SettingsClientPage
      initialSettings={settings || {}}
      saved={!!params.saved}
    />
  );
}