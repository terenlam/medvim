import type { Metadata } from "next";

import Readme from "@/README.md";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <Readme />
    </main>
  );
}

