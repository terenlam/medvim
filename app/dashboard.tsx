import { useExtracted } from "next-intl";

import { Kbd } from "@/components/ui/kbd";

/** Brand name — deliberately not translated. */
const header = "Medvim";

const dashboardShortcuts = [
  { key: "A", id: "about" },
  { key: "s", id: "search" },
  { key: "l", id: "language" },
] as const;

type DashboardShortcutId = (typeof dashboardShortcuts)[number]["id"];

/**
 * Extracted labels, keyed by shortcut id.
 *
 * Messages must be string literals passed to `t` inside the function body that
 * created it, so the labels live here and the list above only looks them up.
 */
function useDashboardShortcutLabels(): Record<DashboardShortcutId, string> {
  const t = useExtracted();

  return {
    about: t({ message: "About", description: "Shortcut that opens the about page" }),
    search: t({ message: "Search", description: "Shortcut that opens the medication search" }),
    language: t({
      // An explicit id is needed here: the French label intentionally reads
      // "Fr -> En" while the source string is the English "En -> Fr".
      id: "Dashboard.language",
      message: "En -> Fr",
      description: "Shortcut that switches the interface language",
    }),
  };
}

export function Dashboard() {
  const t = useExtracted();
  const labels = useDashboardShortcutLabels();

  return (
    <main className="flex min-h-[75vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl">{header}</h1>

        <div
          aria-label={t({ message: "Dashboard shortcuts", description: "Accessible name of the shortcut list" })}
          className="mt-8 flex flex-col gap-2 text-sm min-w-64"
        >
          {dashboardShortcuts.map(({ key, id }) => (
            <div key={key} className="flex justify-between">
              <span>{labels[id]}</span>
              <Kbd>{key}</Kbd>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
