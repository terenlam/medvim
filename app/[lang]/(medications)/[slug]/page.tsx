import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { getMedication } from "@/lib/medications/getMedication";
import { getMedicationSummary } from "@/lib/medications/summary";
import { medications } from "@/lib/medications/medications";

export function generateStaticParams() {
  return medications.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const medication = getMedication(slug);

  if (!medication) {
    notFound();
  }

  return { title: medication.name };
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  const medication = getMedication(slug);

  if (!medication || !hasLocale(routing.locales, lang)) {
    notFound();
  }

  const summary = getMedicationSummary(medication, lang);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl">{medication.name}</h1>
      <p className="whitespace-pre-line">{summary}</p>
    </div>
  );
}
