/** @vitest-environment happy-dom */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  hiddenMedication,
  openSearch,
  searchPlaceholder,
  visibleMedications,
} from "./command-box.test-utils";
import { renderWithIntl } from "@/test/intl";
import { AppShell } from "./app-shell";

describe("readline-style editing shortcuts", () => {
  it("deletes the character to the left with Ctrl+H", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "aspirin");
    await user.keyboard("{Control>}h{/Control}");

    expect(input.value).toBe("aspiri");
    expect(input.selectionStart).toBe(6);
  });

  it("deletes the word to the left with Ctrl+Alt+H and re-filters the list", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "gospel");
    expect(screen.getByText(hiddenMedication.name)).toBeDefined();

    await user.keyboard("{Control>}{Alt>}h{/Alt}{/Control}");

    expect(input.value).toBe("");
    expect(screen.getByText(visibleMedications[0].name)).toBeDefined();
    expect(screen.queryByText(hiddenMedication.name)).toBeNull();
  });

  it("moves to the start with Ctrl+A and to the end with Ctrl+E", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "bench");
    await user.keyboard("{Control>}a{/Control}");

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);

    await user.keyboard("{Control>}e{/Control}");

    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });

  it("moves the caret by one character with Ctrl+B and Ctrl+F", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "bench");
    await user.keyboard("{Control>}a{/Control}");

    expect(input.selectionStart).toBe(0);

    await user.keyboard("{Control>}f{/Control}");

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);

    await user.keyboard("{Control>}b{/Control}");

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);
    expect(input.value).toBe("bench");
  });

  it("moves the caret by one word with Alt+B and Alt+F", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "bench boots");

    expect(input.selectionStart).toBe(11);

    await user.keyboard("{Alt>}b{/Alt}");

    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);

    await user.keyboard("{Alt>}f{/Alt}");

    expect(input.selectionStart).toBe(11);
    expect(input.selectionEnd).toBe(11);
    expect(input.value).toBe("bench boots");
  });

  it("deletes the character under the caret with Ctrl+D", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "aspirin");
    await user.keyboard("{Control>}a{/Control}");

    expect(input.selectionStart).toBe(0);

    await user.keyboard("{Control>}d{/Control}");

    expect(input.value).toBe("spirin");
    expect(input.selectionStart).toBe(0);
  });

  it("deletes to the start with Ctrl+U", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "gospel");
    await user.keyboard("{Control>}u{/Control}");

    expect(input.value).toBe("");
    expect(screen.getByText(visibleMedications[0].name)).toBeDefined();
    expect(screen.queryByText(hiddenMedication.name)).toBeNull();
  });

  it("deletes the next word with Alt+D", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "bench boots");
    await user.keyboard("{Alt>}b{/Alt}");

    expect(input.selectionStart).toBe(5);

    await user.keyboard("{Alt>}d{/Alt}");

    expect(input.value).toBe("bench");
    expect(input.selectionStart).toBe(5);
  });

  it("keeps the controlled add-medication query in sync with Ctrl+H", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;
    await user.type(input, "counter");
    await user.keyboard("{Control>}h{/Control}");

    expect(input.value).toBe("counte");
  });

  it("keeps the controlled add-medication query in sync with Ctrl+U", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;
    await user.type(input, "counter");
    await user.keyboard("{Control>}u{/Control}");

    expect(input.value).toBe("");
  });
});

