import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "always",
  pathnames: {
    // Every route the app navigates to must be declared here: with `pathnames`
    // configured, next-intl strictly types `href`/`router.push` arguments to
    // exactly these entries. Declare a new route before linking to it.
    //
    // List *every* locale for a route that has localized pathnames. The
    // middleware resolves a static entry before the dynamic `/[slug]` entry
    // below, but only if it can match the incoming path: an entry with just
    // `{fr: …}` never matches `/about`, so `/[slug]` would swallow it.
    "/about": {
      en: "/about",
      fr: "/a-propos",
    },
    // Medication detail pages (`app/[lang]/(medications)/[slug]`). Identity
    // mapping: slugs come from data and are not localized. Because the segment
    // is dynamic, `href`/`router.push` require the object form
    // `{pathname: "/[slug]", params: {slug}}` — and `usePathname()` returns the
    // `/[slug]` template, so locale switches must pass `useParams()` as well.
    "/[slug]": "/[slug]",
  },
  localeCookie: {
    // Custom cookie name
    name: "USER_LOCALE",
    // Expire in one year
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: unknown): value is Locale {
  return routing.locales.includes(value as Locale);
}
