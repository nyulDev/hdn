-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuoPpn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME,
    "noQuo" TEXT NOT NULL,
    "noPt" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "pn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kodeImpa" TEXT,
    "qty" REAL NOT NULL,
    "invoicedQty" REAL NOT NULL DEFAULT 0,
    "satuan" TEXT NOT NULL,
    "unitPriceNew" REAL NOT NULL,
    "totalNew" REAL NOT NULL,
    "isInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "isTtb" BOOLEAN NOT NULL DEFAULT false,
    "ttbQty" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_QuoPpn" ("createdAt", "description", "id", "isInvoiced", "isTtb", "kodeImpa", "noPenawaran", "noPt", "noQuo", "pn", "qty", "satuan", "tanggal", "totalNew", "unitPriceNew", "updatedAt") SELECT "createdAt", "description", "id", "isInvoiced", "isTtb", "kodeImpa", "noPenawaran", "noPt", "noQuo", "pn", "qty", "satuan", "tanggal", "totalNew", "unitPriceNew", "updatedAt" FROM "QuoPpn";
DROP TABLE "QuoPpn";
ALTER TABLE "new_QuoPpn" RENAME TO "QuoPpn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
