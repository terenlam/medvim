import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithIntl } from "@/test/intl";
import { AppShell } from "./app-shell";
import { medications } from "@/lib/medications/medications";

const { pushMock, replaceMock, medicationsMock, routeMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  /** The route the mocked navigation APIs report; see `mockRoute`. */
  routeMock: { pathname: "/", params: {} as Record<string, string> },
  medicationsMock: [
    { slug: "bench", name: "Bench" },
    { slug: "boots", name: "Boots" },
    { slug: "corner", name: "Corner" },
    { slug: "donor", name: "Donor" },
    { slug: "foster", name: "Foster" },
    { slug: "gospel", name: "Gospel" },
  ],
}));

/**
 * Minimal stand-in for next-intl's href resolution: fill in dynamic params and
 * prefix the locale, so tests can assert real URLs.
 */
function resolveHref(href: unknown): string {
  if (typeof href === "string") return href;

  const { pathname, params } = href as { pathname: string; params?: Record<string, string> };
  const internal = pathname.replace(/\[\[?([^\]]+?)\]?\]/g, (_match, key: string) => params?.[key] ?? "");

  return `/en${internal === "/" ? "" : internal}`;
}

// Locale-aware navigation has no router context in tests, so provide a
// minimal stand-in (registered before `AppShell` is imported below).
vi.mock("@/i18n/navigation", async () => {
  const react = await import("react");
  return {
    Link: ({ href, children, ...props }: React.ComponentProps<"a">) =>
      react.createElement("a", { href: resolveHref(href), ...props }, children),
    useRouter: () => ({ push: pushMock, replace: replaceMock }),
    usePathname: () => routeMock.pathname,
    redirect: vi.fn(),
    getPathname: vi.fn(),
  };
});

// `LanguageSwitcher` reads the current params from the Next.js app router, which
// isn't mounted in tests.
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useParams: () => routeMock.params,
}));

vi.mock("@/lib/medications/medications", () => ({
  medications: medicationsMock,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(),
}));

export { pushMock, replaceMock, medicationsMock };

/**
 * Pretend the app is on `pathname`, e.g. `mockRoute("/[slug]", { slug: "boots" })`
 * to stand on a medication page. Reset to the dashboard before every test.
 */
export function mockRoute(pathname: string, params: Record<string, string> = {}) {
  routeMock.pathname = pathname;
  routeMock.params = params;
}

/** The href `router.push` receives for a medication page (dynamic segment). */
export function medicationHref(slug: string) {
  return { pathname: "/[slug]", params: { slug } };
}

beforeEach(() => mockRoute("/"));

export const visibleMedications = medications.slice(0, 5);
export const hiddenMedication = medications[5];

/**
 * Source-locale copy: `useExtracted` messages are only compiled to catalog
 * lookups by the Next.js build, so tests assert the inline messages.
 */
export const searchPlaceholder = "Type a command or search...";
export const namePlaceholder = "Type a medication name...";

export function openSearch(user: ReturnType<typeof userEvent.setup>) {
  return user.keyboard("s");
}

export async function renderWithMedications(...slugs: string[]) {
  const user = userEvent.setup();
  renderWithIntl(<AppShell>content</AppShell>);

  await user.keyboard("a");

  for (const slug of slugs) {
    const medication = medications.find(({ slug: candidate }) => candidate === slug);
    if (medication?.slug === "gospel") {
      const input = screen.getByPlaceholderText(namePlaceholder) as HTMLInputElement;
      await user.type(input, "gospel");
    }
    await user.click(screen.getByText(medication!.name));
  }

  await user.keyboard("{Escape}");
  return user;
}
