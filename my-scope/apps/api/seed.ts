import { prisma } from "./lib/prisma";

async function main() {
  await prisma.drug.createMany({
    data: [
      { id: "1", rxnorm: "197361", name: "Amlodipine" },
      { id: "2", rxnorm: "5487", name: "Furosemide" }
    ]
  })

  await prisma.cascade.create({
    data: {
      drugAId: "1",
      drugBId: "2",
      adverseEffect: "Peripheral edema",
      indication: "Edema",
      solution: "Consider reducing amlodipine dose",
      reference: "BMJ Prescribing Cascades"
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
