import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary, locales } from "./dictionaries";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.meta.title} | ${dict.meta.subtitle}`,
    description: dict.meta.description,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div className={`${fraunces.variable} min-h-full flex flex-col font-sans bg-creme text-carvao`}>
      {children}
    </div>
  );
}
