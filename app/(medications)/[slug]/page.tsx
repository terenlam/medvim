import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMedication } from "@/lib/medications/getMedication";
import { medications } from "@/lib/medications/medications";

export function generateStaticParams() {
  return medications.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const medication = getMedication(slug);

  if (!medication) {
    notFound();
  }

  return { title: medication.name };
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const medication = getMedication(slug);

  if (!medication) {
    notFound();
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl">{medication.name}</h1>
      </div>
    </main>
  );
}
