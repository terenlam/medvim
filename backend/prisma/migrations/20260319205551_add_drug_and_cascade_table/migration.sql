-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "rxnorm" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cascade" (
    "id" TEXT NOT NULL,
    "drugAId" TEXT NOT NULL,
    "drugBId" TEXT NOT NULL,
    "adverseEffect" TEXT NOT NULL,
    "indication" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "reference" TEXT NOT NULL,

    CONSTRAINT "Cascade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drug_rxnorm_key" ON "Drug"("rxnorm");

-- AddForeignKey
ALTER TABLE "Cascade" ADD CONSTRAINT "Cascade_drugAId_fkey" FOREIGN KEY ("drugAId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cascade" ADD CONSTRAINT "Cascade_drugBId_fkey" FOREIGN KEY ("drugBId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
