import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";
import { medications } from "@/lib/medications/medications";

const { pushMock, medicationsMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  medicationsMock: [
    { slug: "bench", name: "Bench" },
    { slug: "boots", name: "Boots" },
    { slug: "corner", name: "Corner" },
    { slug: "donor", name: "Donor" },
    { slug: "foster", name: "Foster" },
    { slug: "gospel", name: "Gospel" },
  ],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/medications/medications", () => ({
  medications: medicationsMock,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(),
}));

export { pushMock, medicationsMock };

export const visibleMedications = medications.slice(0, 5);
export const hiddenMedication = medications[5];

export const searchPlaceholder = "Type a command or search...";

export function openSearch(user: ReturnType<typeof userEvent.setup>) {
  return user.keyboard("s");
}

export async function renderWithMedications(...slugs: string[]) {
  const user = userEvent.setup();
  render(<AppShell>content</AppShell>);

  await user.keyboard("a");

  for (const slug of slugs) {
    const medication = medications.find(({ slug: candidate }) => candidate === slug);
    if (medication?.slug === "gospel") {
      const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;
      await user.type(input, "gospel");
    }
    await user.click(screen.getByText(medication!.name));
  }

  await user.keyboard("{Escape}");
  return user;
}