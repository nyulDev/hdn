import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/profit-snapshot
// Body: { noQuo: string; useBansos: boolean }
// Tujuan: hitung snapshot seperti di src/app/profit/page.tsx lalu simpan ke tabel Profit.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      noQuo?: string;
      useBansos?: boolean;
    };

    const noQuo = body.noQuo ? String(body.noQuo).trim() : undefined;
    const useBansos =
      typeof body.useBansos === "boolean" ? body.useBansos : undefined;

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }
    if (typeof useBansos !== "boolean") {
      return NextResponse.json(
        { error: "useBansos (boolean) is required" },
        { status: 400 },
      );
    }

    // Penawaran untuk noQuo
    const penawaran = await prisma.penawaran.findFirst({
      where: { noQuo },
      select: { id: true, noPenawaran: true },
    });

    // Jika tidak ada penawaran, tetap buat row Profit minimal (supaya noQuo ada di tabel profit)
    if (!penawaran?.noPenawaran) {
      const profit = await prisma.profit.upsert({
        where: { noQuo },
        update: { bansosUsed: useBansos },
        create: { noQuo, bansosUsed: useBansos },
      });

      return NextResponse.json({ ok: true, profit });
    }

    // ReportQuo untuk discount
    const reportQuo = await prisma.reportQuo.findUnique({
      where: { noQuo },
      select: { discount: true },
    });

    const quoDiscount = reportQuo?.discount ?? 0;

    // ReportInv untuk totalAfterDiscount (AKTUAL INVOICE)
    const reportInv = await prisma.reportInv.findUnique({
      where: { noPenawaran: penawaran.noPenawaran.trim() },
      select: { totalAfterDiscount: true },
    });

    console.log("profit-snapshot reportInv", {
      noQuo,
      noPenawaran: penawaran.noPenawaran,
      riFound: !!reportInv,
      totalAfterDiscount: reportInv?.totalAfterDiscount,
    });

    const invoiceAktual = Number(reportInv?.totalAfterDiscount || 0);

    // QuoPpn untuk estimasi PPN (subTotal - discount)
    // Estimasi PPN = sum(QuoPpn.totalNew) - discount
    const quoPpns = await prisma.quoPpn.findMany({
      where: { noQuo },
      select: { totalNew: true },
    });

    const subTotalQuo = quoPpns.reduce((sum, q) => sum + (q.totalNew || 0), 0);
    const invoiceEstimasi = subTotalQuo - quoDiscount;

    // Modals regular (tanpa isAktual filter) yang dipakai di UI: modals filter !isAktual
    // Tapi di UI profit/page.tsx modals di-load dari /api/modal kemudian difilter !isAktual
    // Di DB model Modal: isAktual boolean.
    const modals = await prisma.modal.findMany({
      where: { noQuo, isAktual: false },
      select: {
        amount: true,
        description: true,
        unitPrice: true,
        nilaiAktual: true,
        pn: true,
      },
    });

    const modalAktual = modals.reduce(
      (sum, m) => sum + (m.nilaiAktual ?? m.unitPrice ?? 0),
      0,
    );
    const modalEstimasi = modalAktual; // UI set estimasiPpn modalCardData = totalModalAktual

    // Modal card value di UI: totalModalAktual dari /api/report/modal-aktual
    // Untuk konsistensi dengan UI tanpa memanggil endpoint internal, kita hitung via model Modal yang relevan.
    // Rumus HSI di UI menggunakan modal.amount dan modalCost fields.
    // Jadi kita perlu totalModalAktual yang benar-benar sesuai UI tersebut.
    // Saat ini kita gunakan nilai sum(nilaiAktual/unitPrice) sebagai pendekatan.

    // ModalCost (shipping cost breakdown) dari modalCosts (api/modal-cost)
    const modalCost = await prisma.modalCost.findUnique({
      where: { noQuo },
    });

    console.log("profit-snapshot modalCost", {
      noQuo,
      found: !!modalCost,
      discount: modalCost?.discount,
      bankCharge: modalCost?.bankCharge,
      packingCost: modalCost?.packingCost,
      deliveryDutyTaxPercent: modalCost?.deliveryDutyTaxPercent,
    });

    // HSI value (formula persis di UI)
    const parse = (val: any) => parseFloat(String(val ?? "0")) || 0;
    const subTotalAmount = modals.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );

    console.log("profit-snapshot modals", {
      noQuo,
      modalsCount: modals.length,
      subTotalAmount,
      modalAktual,
    });

    const totalDiscount = parse(modalCost?.discount);

    const totalBankCharge = parse(modalCost?.bankCharge);
    const totalPackingCost = parse(modalCost?.packingCost);

    const deliveryDutyTaxPercent = parse(modalCost?.deliveryDutyTaxPercent);
    const totalDeliveryDutyTax =
      (deliveryDutyTaxPercent / 100) * subTotalAmount;

    const totalDeliveryAirDHL = parse(modalCost?.deliveryAirDHL);
    const totalDeliveryAirDoorToDoor = parse(modalCost?.deliveryAirDoorToDoor);
    const totalDeliverySeaResmi = parse(modalCost?.deliverySeaResmi);
    const totalDeliverySeaDoorToDoor = parse(modalCost?.deliverySeaDoorToDoor);
    const totalDeliveryLocalCost = parse(modalCost?.deliveryLocalCost);

    const totalDelivery =
      totalDeliveryDutyTax +
      totalDeliveryAirDHL +
      totalDeliveryAirDoorToDoor +
      totalDeliverySeaResmi +
      totalDeliverySeaDoorToDoor +
      totalDeliveryLocalCost;

    const totalFeeKurir = parse(modalCost?.feeKurir);
    const totalOtherCostTruck = parse(modalCost?.otherCostTruck);
    const totalOtherCostServiceBoat = parse(modalCost?.otherCostServiceBoat);
    const totalOtherCostLainLain = parse(modalCost?.otherCostLainLain);
    const totalOtherCost =
      totalFeeKurir +
      totalOtherCostTruck +
      totalOtherCostServiceBoat +
      totalOtherCostLainLain;

    const hsi =
      (subTotalAmount +
        totalDiscount +
        totalBankCharge +
        totalPackingCost +
        totalDelivery +
        totalOtherCost) *
      0.08;

    // GROSS PROFIT
    const grossProfitAktual = invoiceAktual - modalAktual;
    const grossProfitEstimasi = invoiceEstimasi - modalEstimasi;

    // BANSOS (dipisah aktual vs estimasi, sesuai UI)
    const bansosAktual = useBansos
      ? Math.round((invoiceAktual / 1.15) * 0.05)
      : 0;
    const bansosEstimasi = useBansos ? Math.round(invoiceEstimasi * 0.05) : 0;

    // NET PROFIT
    const netProfitAktual = grossProfitAktual * 0.9 - bansosAktual - hsi;
    const netProfitEstimasi =
      grossProfitEstimasi - bansosEstimasi - hsi - grossProfitEstimasi * 0.1;

    console.log("profit-snapshot computed", {
      noQuo,
      invoiceAktual,
      invoiceEstimasi,
      modalAktual,
      modalEstimasi,
      grossProfitAktual,
      grossProfitEstimasi,
      bansosAktual,
      bansosEstimasi,
      hsi,
      netProfitAktual,
      netProfitEstimasi,
      useBansos,
    });

    // Extra guard: pastikan semua angka tidak menjadi null/undefined.
    // Kalau ada field angka di DB yang nullable, tetap masukkan number value.
    const profitSafe = {
      bansosUsed: useBansos,
      invoiceAktual: Number(invoiceAktual || 0),
      invoiceEstimasi: Number(invoiceEstimasi || 0),
      modalAktual: Number(modalAktual || 0),
      modalEstimasi: Number(modalEstimasi || 0),
      grossProfitAktual: Number(grossProfitAktual || 0),
      grossProfitEstimasi: Number(grossProfitEstimasi || 0),
      bansosAktual: Number(bansosAktual || 0),
      bansosEstimasi: Number(bansosEstimasi || 0),
      hsi: Number(hsi || 0),
      netProfitAktual: Number(netProfitAktual || 0),
      netProfitEstimasi: Number(netProfitEstimasi || 0),
    };

    console.log("profit-snapshot profitSafe", {
      ...profitSafe,
      noQuo,
    });

    // Normalize key untuk menghindari mismatch karena whitespace/tab tersimpan di DB
    const noQuoKey = String(noQuo).trim().replace(/\s+/g, " ");

    console.log("PROFIT-SNAPSHOT HIT", {
      noQuo,
      useBansos,
      noQuoKey,
    });

    console.log("profit-snapshot upsert", {
      noQuo,
      noQuoKey,
      profitSafe,
    });

    const profit = await prisma.profit.upsert({
      where: { noQuo: noQuoKey },

      update: {
        bansosUsed: profitSafe.bansosUsed,
        invoiceAktual: profitSafe.invoiceAktual,
        invoiceEstimasi: profitSafe.invoiceEstimasi,
        modalAktual: profitSafe.modalAktual,
        modalEstimasi: profitSafe.modalEstimasi,
        grossProfitAktual: profitSafe.grossProfitAktual,
        grossProfitEstimasi: profitSafe.grossProfitEstimasi,
        bansosAktual: profitSafe.bansosAktual,
        bansosEstimasi: profitSafe.bansosEstimasi,
        hsi: profitSafe.hsi,
        netProfitAktual: profitSafe.netProfitAktual,
        netProfitEstimasi: profitSafe.netProfitEstimasi,
      },

      create: {
        noQuo,
        bansosUsed: profitSafe.bansosUsed,
        invoiceAktual: profitSafe.invoiceAktual,
        invoiceEstimasi: profitSafe.invoiceEstimasi,
        modalAktual: profitSafe.modalAktual,
        modalEstimasi: profitSafe.modalEstimasi,
        grossProfitAktual: profitSafe.grossProfitAktual,
        grossProfitEstimasi: profitSafe.grossProfitEstimasi,
        bansosAktual: profitSafe.bansosAktual,
        bansosEstimasi: profitSafe.bansosEstimasi,
        hsi: profitSafe.hsi,
        netProfitAktual: profitSafe.netProfitAktual,
        netProfitEstimasi: profitSafe.netProfitEstimasi,
      },
    });

    return NextResponse.json({ ok: true, profit });
  } catch (error) {
    console.error("profit-snapshot error", error);
    return NextResponse.json(
      { error: "Failed to create profit snapshot" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
