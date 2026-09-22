"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { isEditableTarget } from "@/lib/editable-target";

export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // `usePathname()` returns the internal pathname *template* for dynamic
  // segments (e.g. `/[slug]`), so the current params have to travel with it —
  // otherwise switching locale on a medication page would drop the slug.
  const params = useParams();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key !== "l" || isEditableTarget(event.target)) return;

      event.preventDefault();
      // With two locales this is a toggle; with more it cycles through them.
      const nextIndex = (routing.locales.indexOf(activeLocale) + 1) % routing.locales.length;
      router.replace(
        // @ts-expect-error -- `pathname` and `params` always describe the same
        // current route, but TypeScript can't narrow that pairing generically.
        // https://next-intl.dev/docs/routing/navigation#userouter-change-locale
        { pathname, params },
        { locale: routing.locales[nextIndex] },
      );
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeLocale, pathname, params, router]);

  return <></>;
}
