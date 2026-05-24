import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "../../dictionaries";
import { DiagnosticFlow } from "./diagnostic-flow";

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        <DiagnosticFlow lang={lang} />
      </div>
    </main>
  );
}
