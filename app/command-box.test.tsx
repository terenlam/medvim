/** @vitest-environment happy-dom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandWithShortcuts } from "./command-box";
import { medications } from "@/lib/medications/medications";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const visibleMedications = medications.slice(0, 5);
const hiddenMedication = medications[5];

describe("CommandWithShortcuts", () => {
  it("has no button to open the menu", () => {
    render(<CommandWithShortcuts />);
    expect(screen.queryByRole("button", { name: "Open Menu" })).toBeNull();
  });

  it("does not open the command box when 'a' is not pressed in normal mode", () => {
    render(<CommandWithShortcuts />);
    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
  });

  it("opens the command box when pressing 'a' in normal mode", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();
  });

  it("does not open when typing 'a' into another text field", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    const field = document.createElement("input");
    document.body.appendChild(field);

    await user.type(field, "a");

    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
    onTestFinished(() => {
      document.body.removeChild(field);
    });
  });

  it("types 'a' into the input instead of reopening when open", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a command or search...") as HTMLInputElement;
    input.focus();

    await user.keyboard("a");
    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();
    expect(input.value).toBe("a");
  });
  it("closes the command box when pressing Escape", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("{Esc}");

    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
  });
});

describe("CommandWithShortcuts medications", () => {
  it("lists every visible medication with its Alt shortcut", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");

    visibleMedications.forEach((medication, index) => {
      expect(screen.getByText(medication.name)).toBeDefined();
      expect(screen.getByText(`Alt + ${index + 1}`)).toBeDefined();
    });
  });

  it("shows only the first 5 medications by default", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");

    expect(screen.getByText(visibleMedications[4].name)).toBeDefined();
    expect(screen.queryByText(hiddenMedication.name)).toBeNull();
  });

  it("shows at most 5 medications while searching", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a command or search..."), "a");

    expect(screen.getAllByRole("option").length).toBeLessThanOrEqual(5);
  });

  it("reveals a hidden medication when searching for it", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a command or search..."), "warf");

    expect(screen.getByText(hiddenMedication.name)).toBeDefined();
    expect(screen.queryByText(visibleMedications[0].name)).toBeNull();
  });

  it("labels shortcuts by filtered position while searching", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a command or search..."), "a");

    const rivaroxaban = screen.getByRole("option", { name: /Rivaroxaban/i });
    expect(rivaroxaban.textContent).toContain("Alt + 4");

    const warfarin = screen.getByRole("option", { name: /Warfarin/i });
    expect(warfarin.textContent).toContain("Alt + 5");
  });

  it("navigates to the medication at the filtered position with Alt+n", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a command or search..."), "a");
    await user.keyboard("{Alt>}5{/Alt}");

    expect(pushMock).toHaveBeenCalledWith("/warfarin");
  });

  it("navigates to a hidden medication when selecting it from search", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a command or search..."), "warf");
    await user.click(screen.getByText(hiddenMedication.name));

    expect(pushMock).toHaveBeenCalledWith(`/${hiddenMedication.slug}`);
  });

  it("navigates to the medication page when selecting an item", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.click(screen.getByText(visibleMedications[0].name));

    expect(pushMock).toHaveBeenCalledWith(`/${visibleMedications[0].slug}`);
  });

  it("navigates to the nth medication when pressing Alt+n", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    await user.keyboard("{Alt>}1{/Alt}");

    expect(pushMock).toHaveBeenCalledWith(`/${visibleMedications[0].slug}`);
  });
});