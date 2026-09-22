import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!hasLocale(routing.locales, locale)) {
    const param = await lang();
    if (!hasLocale(routing.locales, param)) {
      notFound();
    }
    locale = param;
  }

  return {
    locale,
    // `.po` files are turned into plain message objects by the Turbopack/
    // Webpack loader configured in `next.config.ts`.
    messages: (await import(`../messages/${locale}.po`)).default,
  };
});
