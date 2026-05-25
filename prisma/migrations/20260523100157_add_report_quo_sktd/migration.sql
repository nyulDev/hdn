-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportQuo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noQuo" TEXT NOT NULL,
    "atsn" TEXT,
    "note" TEXT,
    "discount" REAL,
    "sktd" BOOLEAN NOT NULL DEFAULT false,
    "bansosUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "delivery" TEXT,
    "price" TEXT
);
INSERT INTO "new_ReportQuo" ("atsn", "createdAt", "delivery", "discount", "id", "noQuo", "note", "price", "updatedAt") SELECT "atsn", "createdAt", "delivery", "discount", "id", "noQuo", "note", "price", "updatedAt" FROM "ReportQuo";
DROP TABLE "ReportQuo";
ALTER TABLE "new_ReportQuo" RENAME TO "ReportQuo";
CREATE UNIQUE INDEX "ReportQuo_noQuo_key" ON "ReportQuo"("noQuo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
