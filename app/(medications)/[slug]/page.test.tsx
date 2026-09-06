import { render, screen } from "@testing-library/react";

import { medications } from "@/lib/medications/medications";

import Page, { generateMetadata, generateStaticParams } from "./page";

function pageProps(slug: string) {
  return {
    params: Promise.resolve({ slug }),
    searchParams: Promise.resolve({}) as Promise<Record<string, string | string[] | undefined>>,
  };
}

describe("medication [slug] page", () => {
  describe("generateStaticParams", () => {
    it("returns a { slug } param object for every medication in the catalog", () => {
      expect(generateStaticParams()).toEqual(medications.map(({ slug }) => ({ slug })));
    });

    it("returns only slugs that exist in the catalog", () => {
      const catalogSlugs = new Set(medications.map(({ slug }) => slug));
      for (const { slug } of generateStaticParams()) {
        expect(catalogSlugs.has(slug)).toBe(true);
      }
    });
  });

  describe("generateMetadata", () => {
    it("returns the medication name as the page title", async () => {
      const medication = medications[0];

      await expect(generateMetadata(pageProps(medication.slug))).resolves.toEqual({
        title: medication.name,
      });
    });

    it("resolves to a title for every medication in the catalog", async () => {
      for (const medication of medications) {
        await expect(generateMetadata(pageProps(medication.slug))).resolves.toEqual({
          title: medication.name,
        });
      }
    });

    it("throws the not-found error for an unknown slug", async () => {
      await expect(generateMetadata(pageProps("does-not-exist"))).rejects.toThrow(
        "NEXT_HTTP_ERROR_FALLBACK;404",
      );
    });
  });

  describe("Page", () => {
    it("renders the medication name in an <h1>", async () => {
      const medication = medications[0];
      render(await Page(pageProps(medication.slug)));

      const heading = await screen.findByRole("heading", { level: 1 });
      expect(heading.textContent).toBe(medication.name);
    });

    it("renders the correct medication for every slug in the catalog", async () => {
      for (const medication of medications) {
        const { unmount } = render(await Page(pageProps(medication.slug)));

        const heading = await screen.findByRole("heading", { level: 1 });
        expect(heading.textContent).toBe(medication.name);
        unmount();
      }
    });

    it("rejects with the not-found error for an unknown slug", async () => {
      await expect(Page(pageProps("does-not-exist"))).rejects.toThrow(
        "NEXT_HTTP_ERROR_FALLBACK;404",
      );
    });
  });
});
