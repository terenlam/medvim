import { Kbd } from "@/components/ui/kbd";

interface DashboardKey {
  key: string;
  description: string;
}

const dashboardKeys: DashboardKey[] = [
  { key: "s", description: "Search a medication" },
  { key: "h", description: "Help" },
  { key: "?", description: "About" },
];

const header = "Medvim";

export function Dashboard() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl">{header}</h1>

        <div aria-label="Dashboard shortcuts" className="mt-8 flex flex-col gap-2 text-sm min-w-64">
          {dashboardKeys.map(({ key, description }) => (
            <div key={key} className="flex justify-between">
              <span>{description}</span>
              <Kbd>{key}</Kbd>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
