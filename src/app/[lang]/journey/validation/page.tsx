import { notFound, redirect } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { createClient } from "@/lib/supabase/server";
import { ValidationFlow } from "./validation-flow";
import { BLOCKER_LABELS } from "@/lib/path";
import { type BlockerName } from "@/lib/types";

export default async function ValidationPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const { data: journey } = await supabase
    .from("journeys")
    .select("*, diagnostics(*)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!journey) redirect(`/${lang}/journey`);

  const { data: integrations } = await supabase
    .from("annotations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_integration", true)
    .order("created_at");

  const { data: firstAnnotation } = await supabase
    .from("annotations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .single();

  const pathOrder = (journey.path_order || []) as BlockerName[];
  const diagnostic = journey.diagnostics as {
    blocker_totals: Record<BlockerName, number>;
    active_blockers: BlockerName[];
  } | null;

  const blockerLabels: Record<string, string> = {};
  for (const b of pathOrder) {
    blockerLabels[b] = BLOCKER_LABELS[b][lang as "pt" | "en"];
  }

  return (
    <ValidationFlow
      lang={lang}
      pathOrder={pathOrder}
      blockerLabels={blockerLabels}
      diagnosticTotals={diagnostic?.blocker_totals || null}
      firstAnnotation={firstAnnotation?.content || null}
      integrations={(integrations || []).map((a) => ({
        blockerName: a.blocker_name as string,
        content: a.content as string,
      }))}
      lastAnnotation={
        integrations && integrations.length > 0
          ? integrations[integrations.length - 1].content as string
          : null
      }
    />
  );
}
