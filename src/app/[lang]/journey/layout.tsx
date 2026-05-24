import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SafetyButton } from "@/components/safety-button";
import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";

export default async function JourneyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/auth/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <>
      {children}
      <SafetyButton label={dict.safety.helpNow} dict={dict.safety} />
    </>
  );
}
