-- CreateTable
CREATE TABLE "Profit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noQuo" TEXT NOT NULL,
    "bansosUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Profit_noQuo_key" ON "Profit"("noQuo");
