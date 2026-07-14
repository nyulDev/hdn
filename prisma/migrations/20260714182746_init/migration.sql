-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penawaran" (
    "id" TEXT NOT NULL,
    "pt" TEXT NOT NULL,
    "kapal" TEXT,
    "noQuo" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "pn" TEXT,
    "tanggal" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "departemen" TEXT,
    "namaMesin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penawaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modal" (
    "id" TEXT NOT NULL,
    "pt" TEXT,
    "noQuo" TEXT NOT NULL,
    "kodeImpa" TEXT,
    "pn" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "qty" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3),
    "customerId" TEXT,
    "isAktual" BOOLEAN NOT NULL DEFAULT false,
    "discount" DOUBLE PRECISION,
    "totalModalSperpart" DOUBLE PRECISION,
    "bankCharge" DOUBLE PRECISION,
    "packingCost" DOUBLE PRECISION,
    "deliveryDutyTax" DOUBLE PRECISION,
    "deliveryAirDHL" DOUBLE PRECISION,
    "deliveryAirDoorToDoor" DOUBLE PRECISION,
    "deliverySeaResmi" DOUBLE PRECISION,
    "deliverySeaDoorToDoor" DOUBLE PRECISION,
    "deliveryLocalCost" DOUBLE PRECISION,
    "feeKurir" DOUBLE PRECISION,
    "otherCostTruck" DOUBLE PRECISION,
    "otherCostServiceBoat" DOUBLE PRECISION,
    "otherCostLainLain" DOUBLE PRECISION,
    "hsi" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nilaiAktual" DOUBLE PRECISION,
    "noPenawaran" TEXT,
    "namaToko" TEXT,
    "disc" DOUBLE PRECISION,
    "layanan" DOUBLE PRECISION,
    "onkir" DOUBLE PRECISION,

    CONSTRAINT "Modal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoPpn" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3),
    "noQuo" TEXT NOT NULL,
    "noPt" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "pn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kodeImpa" TEXT,
    "qty" DOUBLE PRECISION NOT NULL,
    "invoicedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "satuan" TEXT NOT NULL,
    "unitPriceNew" DOUBLE PRECISION NOT NULL,
    "totalNew" DOUBLE PRECISION NOT NULL,
    "isInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "isTtb" BOOLEAN NOT NULL DEFAULT false,
    "ttbQty" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoPpn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "ptMv" TEXT NOT NULL,
    "alamat" TEXT,
    "kontak" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kapal" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjualans" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "noInvoice" TEXT NOT NULL,
    "invoiceSebelumPajak" DOUBLE PRECISION NOT NULL,
    "ppnSktd" DOUBLE PRECISION NOT NULL,
    "invoiceAfterTax" DOUBLE PRECISION NOT NULL,
    "pengajuanModal" DOUBLE PRECISION NOT NULL,
    "pembelianAktual" DOUBLE PRECISION NOT NULL,
    "grossProfit" DOUBLE PRECISION NOT NULL,
    "marketingFee" DOUBLE PRECISION NOT NULL,
    "bansos" DOUBLE PRECISION NOT NULL,
    "bagiHasilHsi" DOUBLE PRECISION NOT NULL,
    "netProfit" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Belum Lunas',
    "lunasDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "noPenawaran" TEXT,

    CONSTRAINT "penjualans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModalCost" (
    "id" TEXT NOT NULL,
    "noQuo" TEXT NOT NULL,
    "discount" DOUBLE PRECISION,
    "totalModalSperpart" DOUBLE PRECISION,
    "bankCharge" DOUBLE PRECISION,
    "packingCost" DOUBLE PRECISION,
    "deliveryDutyTax" DOUBLE PRECISION,
    "deliveryAirDHL" DOUBLE PRECISION,
    "deliveryAirDoorToDoor" DOUBLE PRECISION,
    "deliverySeaResmi" DOUBLE PRECISION,
    "deliverySeaDoorToDoor" DOUBLE PRECISION,
    "deliveryLocalCost" DOUBLE PRECISION,
    "feeKurir" DOUBLE PRECISION,
    "otherCostTruck" DOUBLE PRECISION,
    "otherCostServiceBoat" DOUBLE PRECISION,
    "otherCostLainLain" DOUBLE PRECISION,
    "hsi" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveryDutyTaxPercent" DOUBLE PRECISION,

    CONSTRAINT "ModalCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModalAktualCost" (
    "id" TEXT NOT NULL,
    "noQuo" TEXT NOT NULL,
    "discount" DOUBLE PRECISION,
    "totalModalSperpart" DOUBLE PRECISION,
    "bankCharge" DOUBLE PRECISION,
    "packingCost" DOUBLE PRECISION,
    "deliveryDutyTax" DOUBLE PRECISION,
    "deliveryDutyTaxPercent" DOUBLE PRECISION,
    "deliveryAirDHL" DOUBLE PRECISION,
    "deliveryAirDoorToDoor" DOUBLE PRECISION,
    "deliverySeaResmi" DOUBLE PRECISION,
    "deliverySeaDoorToDoor" DOUBLE PRECISION,
    "deliveryLocalCost" DOUBLE PRECISION,
    "feeKurir" DOUBLE PRECISION,
    "otherCostTruck" DOUBLE PRECISION,
    "otherCostServiceBoat" DOUBLE PRECISION,
    "otherCostLainLain" DOUBLE PRECISION,
    "hsi" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModalAktualCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportQuo" (
    "id" TEXT NOT NULL,
    "noQuo" TEXT NOT NULL,
    "atsn" TEXT,
    "note" TEXT,
    "discount" DOUBLE PRECISION,
    "sktd" BOOLEAN NOT NULL DEFAULT false,
    "bansosUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "delivery" TEXT,
    "price" TEXT,

    CONSTRAINT "ReportQuo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportInv" (
    "id" TEXT NOT NULL,
    "noPenawaran" TEXT NOT NULL,
    "atsn" TEXT,
    "noPo" TEXT,
    "discount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "dpp" DOUBLE PRECISION,
    "kapal" TEXT,
    "location" TEXT,
    "namaMesin" TEXT,
    "pn" TEXT,
    "ppn" DOUBLE PRECISION,
    "subtotal" DOUBLE PRECISION,
    "totalAfterDiscount" DOUBLE PRECISION,
    "totalInvoice" DOUBLE PRECISION,
    "customerId" TEXT,
    "pt" TEXT,

    CONSTRAINT "ReportInv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profit" (
    "id" TEXT NOT NULL,
    "noQuo" TEXT NOT NULL,
    "bansosUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bansosAktual" DOUBLE PRECISION,
    "bansosEstimasi" DOUBLE PRECISION,
    "grossProfitAktual" DOUBLE PRECISION,
    "grossProfitEstimasi" DOUBLE PRECISION,
    "hsi" DOUBLE PRECISION,
    "invoiceAktual" DOUBLE PRECISION,
    "invoiceEstimasi" DOUBLE PRECISION,
    "modalAktual" DOUBLE PRECISION,
    "modalEstimasi" DOUBLE PRECISION,
    "netProfitAktual" DOUBLE PRECISION,
    "netProfitEstimasi" DOUBLE PRECISION,

    CONSTRAINT "Profit_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Profit_noQuo_key" ON "Profit"("noQuo");

-- AddForeignKey
ALTER TABLE "penjualans" ADD CONSTRAINT "penjualans_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
