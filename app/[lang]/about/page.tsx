import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";

import Readme from "@/README.md";
import AboutFr from "@/content/about.fr.mdx";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Per-locale long-form content. Adding a locale means adding a file here (and
 * a `content/about.<locale>.mdx` translation) — the `satisfies` check keeps
 * every locale covered.
 */
const aboutPages = {
  en: Readme,
  fr: AboutFr,
} satisfies Record<Locale, React.ComponentType>;

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const t = await getExtracted({ locale: lang });

  return { title: t({ message: "About", description: "Title of the about page" }) };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const Content = aboutPages[lang];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <Content />
    </main>
  );
}
