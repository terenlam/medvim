/** @vitest-environment happy-dom */
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithIntl } from "@/test/intl";
import { getSidebarDefaultOpen, SIDEBAR_STATE_COOKIE } from "@/lib/sidebar-state";
import { mockRoute, replaceMock } from "./command-box.test-utils";
import { AppShell } from "./app-shell";

describe("language switcher", () => {
  it("switches locale without leaving the current page", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("l");

    expect(replaceMock).toHaveBeenCalledWith({ pathname: "/", params: {} }, { locale: "fr" });
  });

  // `useExtracted` is only compiled to catalog lookups by the Next.js build, so
  // under Vitest every locale renders the source-locale copy. Translations are
  // covered by `messages/messages.test.ts` instead.
  it("renders the source-locale copy for every locale", () => {
    const { unmount } = renderWithIntl(<AppShell>content</AppShell>);
    expect(screen.getByText("Medications")).toBeDefined();
    unmount();

    renderWithIntl(<AppShell>content</AppShell>, { locale: "fr" });
    expect(screen.getByText("Medications")).toBeDefined();
  });
});

describe("language shortcut (l)", () => {
  beforeEach(() => {
    // Explicitly start from a clean mock so the negative cases below cannot
    // pass on calls from earlier tests.
    replaceMock.mockClear();
    document.cookie = `${SIDEBAR_STATE_COOKIE}=; max-age=0; path=/`;
  });

  it("toggles from English to French", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("l");

    expect(replaceMock).toHaveBeenCalledWith({ pathname: "/", params: {} }, { locale: "fr" });
  });

  it("toggles from French back to English", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>, { locale: "fr" });

    await user.keyboard("l");

    expect(replaceMock).toHaveBeenCalledWith({ pathname: "/", params: {} }, { locale: "en" });
  });

  // With `pathnames` configured, `usePathname()` returns the `/[slug]` template
  // rather than the concrete path, so the params must travel along or the
  // medication would be lost when switching locale.
  it("keeps the current medication when switching locale on a detail page", async () => {
    const user = userEvent.setup();
    mockRoute("/[slug]", { slug: "ibuprofen" });
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("l");

    expect(replaceMock).toHaveBeenCalledWith(
      { pathname: "/[slug]", params: { slug: "ibuprofen" } },
      { locale: "fr" },
    );
  });

  it("keeps a closed sidebar closed when the locale layout remounts", async () => {
    const user = userEvent.setup();
    const firstRender = renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("{Control>}b{/Control}");

    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");
    expect(document.cookie).toContain(`${SIDEBAR_STATE_COOKIE}=false`);

    const persistedState = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${SIDEBAR_STATE_COOKIE}=`))
      ?.split("=")[1];

    // A locale change replaces the [lang] layout, so model that remount here.
    firstRender.unmount();
    renderWithIntl(
      <AppShell defaultOpen={getSidebarDefaultOpen(persistedState)}>content</AppShell>,
    );
    await user.keyboard("l");

    expect(replaceMock).toHaveBeenCalledWith({ pathname: "/", params: {} }, { locale: "fr" });
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");
  });

  const editableTargets: Array<[string, () => HTMLElement]> = [
    ["an input", () => document.createElement("input")],
    ["a textarea", () => document.createElement("textarea")],
    [
      "a contenteditable element",
      () => {
        const element = document.createElement("div");
        element.setAttribute("contenteditable", "true");
        return element;
      },
    ],
  ];

  // A keydown's target is the focused element, so dispatching on the element
  // models "focus is in a text-editable area".
  it.each(editableTargets)(
    "stays inactive when the keydown comes from %s",
    (_description, createTarget) => {
      renderWithIntl(<AppShell>content</AppShell>);
      const target = createTarget();
      document.body.appendChild(target);
      onTestFinished(() => target.remove());

      fireEvent.keyDown(target, { key: "l" });

      expect(replaceMock).not.toHaveBeenCalled();
    },
  );

  it("stays inactive when a modifier key is held", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("{Control>}l{/Control}");

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("stays inactive while the key is held down (repeat events)", () => {
    renderWithIntl(<AppShell>content</AppShell>);

    fireEvent.keyDown(window, { key: "l", repeat: true });

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
