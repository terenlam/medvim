import { Kbd } from "@/components/ui/kbd";

interface DashboardKey {
  key: string;
  description: string;
  icon: string;
}

const dashboardKeys: DashboardKey[] = [
  { icon: "+", key: "a", description: "Ajouter un médicament" },
  { icon: "?", key: "h", description: "Aide" },
];

const header = "Medvim";

export function Dashboard() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl">{header}</h1>

        <div aria-label="Dashboard shortcuts" className="mt-8 flex flex-col gap-2 text-sm min-w-64">
          {dashboardKeys.map(({ icon, key, description }) => (
            <div key={key} className="flex justify-between">
              <div className="flex gap-2">
                <span>{icon}</span>
                <span>{description}</span>
              </div>
              <Kbd>{key}</Kbd>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
