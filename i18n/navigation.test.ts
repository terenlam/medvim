import { routing } from "./routing";
import { getPathname } from "./navigation";

/**
 * The URL contract that every `Link`/`router.push` call site depends on. A
 * `pathnames` entry that is missing, incomplete or shadowed by a dynamic segment
 * changes these URLs silently, so pin them here rather than only in the proxy.
 */
describe("localized pathnames", () => {
  it.each([
    [{ pathname: "/about" }, "en", "/en/about"],
    [{ pathname: "/about" }, "fr", "/fr/a-propos"],
    [{ pathname: "/[slug]", params: { slug: "ibuprofen" } }, "en", "/en/ibuprofen"],
    [{ pathname: "/[slug]", params: { slug: "ibuprofen" } }, "fr", "/fr/ibuprofen"],
  ] as const)("resolves %o in %s to %s", (href, locale, expected) => {
    expect(getPathname({ href, locale })).toBe(expected);
  });

  it("keeps the dynamic medication segment unlocalized in every locale", () => {
    for (const locale of routing.locales) {
      const pathname = getPathname({ href: { pathname: "/[slug]", params: { slug: "boots" } }, locale });

      expect(pathname).toBe(`/${locale}/boots`);
    }
  });
});
