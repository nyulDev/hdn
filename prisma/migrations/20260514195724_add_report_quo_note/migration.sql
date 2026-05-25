-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Penawaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pt" TEXT NOT NULL,
    "kapal" TEXT,
    "noQuo" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "pn" TEXT,
    "tanggal" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "departemen" TEXT,
    "namaMesin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Modal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pt" TEXT,
    "noQuo" TEXT NOT NULL,
    "kodeImpa" TEXT,
    "pn" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "qty" REAL NOT NULL,
    "satuan" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "tanggal" DATETIME,
    "customerId" TEXT,
    "isAktual" BOOLEAN NOT NULL DEFAULT false,
    "discount" REAL,
    "totalModalSperpart" REAL,
    "bankCharge" REAL,
    "packingCost" REAL,
    "deliveryDutyTax" REAL,
    "deliveryAirDHL" REAL,
    "deliveryAirDoorToDoor" REAL,
    "deliverySeaResmi" REAL,
    "deliverySeaDoorToDoor" REAL,
    "deliveryLocalCost" REAL,
    "feeKurir" REAL,
    "otherCostTruck" REAL,
    "otherCostServiceBoat" REAL,
    "otherCostLainLain" REAL,
    "hsi" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nilaiAktual" REAL,
    "noPenawaran" TEXT,
    "namaToko" TEXT,
    "disc" REAL,
    "layanan" REAL,
    "onkir" REAL
);

-- CreateTable
CREATE TABLE "QuoPpn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME,
    "noQuo" TEXT NOT NULL,
    "noPt" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "pn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kodeImpa" TEXT,
    "qty" REAL NOT NULL,
    "satuan" TEXT NOT NULL,
    "unitPriceNew" REAL NOT NULL,
    "totalNew" REAL NOT NULL,
    "isInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "isTtb" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "ptMv" TEXT NOT NULL,
    "alamat" TEXT,
    "kontak" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kapal" TEXT
);

-- CreateTable
CREATE TABLE "penjualans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    "noInvoice" TEXT NOT NULL,
    "invoiceSebelumPajak" REAL NOT NULL,
    "ppnSktd" REAL NOT NULL,
    "invoiceAfterTax" REAL NOT NULL,
    "pengajuanModal" REAL NOT NULL,
    "pembelianAktual" REAL NOT NULL,
    "grossProfit" REAL NOT NULL,
    "marketingFee" REAL NOT NULL,
    "bansos" REAL NOT NULL,
    "bagiHasilHsi" REAL NOT NULL,
    "netProfit" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Belum Lunas',
    "lunasDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "noPenawaran" TEXT,
    CONSTRAINT "penjualans_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModalCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noQuo" TEXT NOT NULL,
    "discount" REAL,
    "totalModalSperpart" REAL,
    "bankCharge" REAL,
    "packingCost" REAL,
    "deliveryDutyTax" REAL,
    "deliveryAirDHL" REAL,
    "deliveryAirDoorToDoor" REAL,
    "deliverySeaResmi" REAL,
    "deliverySeaDoorToDoor" REAL,
    "deliveryLocalCost" REAL,
    "feeKurir" REAL,
    "otherCostTruck" REAL,
    "otherCostServiceBoat" REAL,
    "otherCostLainLain" REAL,
    "hsi" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deliveryDutyTaxPercent" REAL
);

-- CreateTable
CREATE TABLE "ModalAktualCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noQuo" TEXT NOT NULL,
    "discount" REAL,
    "totalModalSperpart" REAL,
    "bankCharge" REAL,
    "packingCost" REAL,
    "deliveryDutyTax" REAL,
    "deliveryDutyTaxPercent" REAL,
    "deliveryAirDHL" REAL,
    "deliveryAirDoorToDoor" REAL,
    "deliverySeaResmi" REAL,
    "deliverySeaDoorToDoor" REAL,
    "deliveryLocalCost" REAL,
    "feeKurir" REAL,
    "otherCostTruck" REAL,
    "otherCostServiceBoat" REAL,
    "otherCostLainLain" REAL,
    "hsi" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReportQuo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noQuo" TEXT NOT NULL,
    "atsn" TEXT,
    "note" TEXT,
    "discount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "delivery" TEXT,
    "price" TEXT
);

-- CreateTable
CREATE TABLE "ReportInv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noPenawaran" TEXT NOT NULL,
    "atsn" TEXT,
    "discount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discountAmount" REAL,
    "dpp" REAL,
    "kapal" TEXT,
    "location" TEXT,
    "namaMesin" TEXT,
    "pn" TEXT,
    "ppn" REAL,
    "subtotal" REAL,
    "totalAfterDiscount" REAL,
    "totalInvoice" REAL,
    "customerId" TEXT,
    "pt" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Penawaran_noPenawaran_key" ON "Penawaran"("noPenawaran");

-- CreateIndex
CREATE UNIQUE INDEX "penjualans_noInvoice_key" ON "penjualans"("noInvoice");

-- CreateIndex
CREATE UNIQUE INDEX "ModalCost_noQuo_key" ON "ModalCost"("noQuo");

-- CreateIndex
CREATE UNIQUE INDEX "ModalAktualCost_noQuo_key" ON "ModalAktualCost"("noQuo");

-- CreateIndex
CREATE UNIQUE INDEX "ReportQuo_noQuo_key" ON "ReportQuo"("noQuo");

-- CreateIndex
CREATE UNIQUE INDEX "ReportInv_noPenawaran_key" ON "ReportInv"("noPenawaran");
