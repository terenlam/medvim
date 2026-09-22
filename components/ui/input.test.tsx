/** @vitest-environment happy-dom */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithIntl } from "@/test/intl";
import { Input } from "./input";
import { Textarea } from "./textarea";

describe("Input", () => {
  it("deletes the word to the left with Ctrl+Alt+H", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="the quick brown fox" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(input.value.length, input.value.length);
    await user.keyboard("{Control>}{Alt>}h{/Alt}{/Control}");

    expect(input.value).toBe("the quick brown");
    expect(input.selectionStart).toBe(15);
  });

  it("deletes the character to the left with Ctrl+H", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(3, 3);
    await user.keyboard("{Control>}h{/Control}");

    expect(input.value).toBe("ab");
    expect(input.selectionStart).toBe(2);
  });

  it("moves the caret to the start with Ctrl+A and to the end with Ctrl+E", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(1, 1);
    await user.keyboard("{Control>}a{/Control}");

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);

    await user.keyboard("{Control>}e{/Control}");

    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);
  });

  it("moves the caret one character back with Ctrl+B and one word forward with Alt+F", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc def" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(2, 2);
    await user.keyboard("{Control>}b{/Control}");

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);

    await user.keyboard("{Alt>}f{/Alt}");

    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);

    await user.keyboard("{Alt>}f{/Alt}");

    expect(input.selectionStart).toBe(7);
    expect(input.selectionEnd).toBe(7);
  });

  it("deletes the character under the caret with Ctrl+D and to the start with Ctrl+U", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(1, 1);
    await user.keyboard("{Control>}d{/Control}");

    expect(input.value).toBe("ac");
    expect(input.selectionStart).toBe(1);

    await user.keyboard("{Control>}u{/Control}");

    expect(input.value).toBe("c");
    expect(input.selectionStart).toBe(0);
  });

  it("still calls a consumer-provided onKeyDown", async () => {
    const onKeyDown = vi.fn();
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" onKeyDown={onKeyDown} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("{Control>}h{/Control}");

    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "h" }));
  });
});

describe("Textarea", () => {
  it("deletes the word to the left with Ctrl+Alt+H", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Textarea defaultValue="hello world" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await user.click(textarea);
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    await user.keyboard("{Control>}{Alt>}h{/Alt}{/Control}");

    expect(textarea.value).toBe("hello");
    expect(textarea.selectionStart).toBe(5);
  });
});