/** @vitest-environment node */
import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { config } from "../proxy";
import { routing } from "./routing";

const handleI18nRouting = createMiddleware(routing);

function request(path: string, acceptLanguage = "en-US,en;q=0.9") {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: { "accept-language": acceptLanguage },
  });
}

describe("i18n proxy", () => {
  it("redirects `/` to the default locale", () => {
    const response = handleI18nRouting(request("/"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/en");
  });

  it("redirects `/` to French when the browser prefers French", () => {
    const response = handleI18nRouting(request("/", "fr-FR,fr;q=0.9,en;q=0.5"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/fr");
  });

  it("redirects unprefixed paths to the localized pathname of the target locale", () => {
    const response = handleI18nRouting(request("/about", "fr-FR,fr;q=0.9"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/fr/a-propos");
  });

  it("redirects a localized pathname back to the internal one for other locales", () => {
    const response = handleI18nRouting(request("/a-propos"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/en/about");
  });

  it("canonicalizes a localized pathname that does not belong to the prefix", () => {
    // `/fr/about` is not a French URL — serving it would duplicate the page.
    expect(handleI18nRouting(request("/fr/about")).headers.get("location")).toBe(
      "http://localhost:3000/fr/a-propos",
    );
    expect(handleI18nRouting(request("/en/a-propos")).headers.get("location")).toBe(
      "http://localhost:3000/en/about",
    );
  });

  it("passes locale-prefixed paths through without a redirect", () => {
    expect(handleI18nRouting(request("/fr/a-propos")).headers.get("location")).toBeNull();
    expect(handleI18nRouting(request("/en/about")).headers.get("location")).toBeNull();
  });

  // The medication route is a dynamic segment, which has to behave like any
  // other declared pathname: prefixed with the locale, but not rewritten.
  it("prefixes dynamic medication paths without rewriting them", () => {
    const response = handleI18nRouting(request("/ibuprofen", "fr-FR,fr;q=0.9"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/fr/ibuprofen");
  });

  it("passes locale-prefixed dynamic medication paths through without a redirect", () => {
    const response = handleI18nRouting(request("/fr/ibuprofen"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects paths with an unsupported locale to a supported one", () => {
    const response = handleI18nRouting(request("/de/about"));

    expect(response.headers.get("location")).toMatch(/http:\/\/localhost:3000\/(en|fr)\//);
  });
});

// The matcher is enforced by the Next.js runtime before the proxy runs, so it
// can only be asserted as a pattern — calling the middleware directly bypasses it.
describe("proxy matcher", () => {
  const matcher = new RegExp(config.matcher);

  it("excludes the file-convention icon route, which is served at the root", () => {
    expect(matcher.test("/icon")).toBe(false);
  });

  it("applies to page paths, including locale-prefixed ones", () => {
    expect(matcher.test("/en")).toBe(true);
    expect(matcher.test("/fr/about")).toBe(true);
    expect(matcher.test("/about")).toBe(true);
  });
});
