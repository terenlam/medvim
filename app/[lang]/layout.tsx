import type { Metadata } from "next";
import { cookies } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getExtracted } from "next-intl/server";
import { notFound } from "next/navigation";

import { inter } from "@/app/ui/fonts";
import { routing } from "@/i18n/routing";
import { getSidebarDefaultOpen, SIDEBAR_STATE_COOKIE } from "@/lib/sidebar-state";
import { AppShell } from "../app-shell";
import "../globals.css";

// Sidebar state is persisted in a request cookie and must survive locale remounts.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const t = await getExtracted({ locale: lang });

  return {
    // The brand name is not translated.
    title: "Medvim",
    description: t({
      message: "Medication management for healthcare professionals caring for older adults.",
      description: "Meta description of the app",
    }),
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const sidebarDefaultOpen = getSidebarDefaultOpen(
    (await cookies()).get(SIDEBAR_STATE_COOKIE)?.value,
  );

  return (
    <html lang={lang} className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <AppShell defaultOpen={sidebarDefaultOpen}>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
