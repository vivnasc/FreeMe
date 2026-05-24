import { notFound, redirect } from "next/navigation";
import { hasLocale } from "../../../dictionaries";
import { createClient } from "@/lib/supabase/server";
import { BLOCKERS } from "@/content/blockers";
import { type BlockerName } from "@/lib/types";
import { BlockerView } from "./blocker-view";

export default async function BlockerPage({
  params,
}: {
  params: Promise<{ lang: string; name: string }>;
}) {
  const { lang, name } = await params;
  if (!hasLocale(lang)) notFound();

  const blocker = BLOCKERS[name as BlockerName];
  if (!blocker) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: annotations } = await supabase
    .from("freeme_annotations")
    .select("*")
    .eq("user_id", user.id)
    .eq("blocker_name", name)
    .order("step_index");

  const { data: journey } = await supabase
    .from("freeme_journeys")
    .select("id, path_order, current_index")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <BlockerView
      lang={lang}
      blocker={blocker}
      savedAnnotations={annotations || []}
      journeyId={journey?.id || null}
    />
  );
}
