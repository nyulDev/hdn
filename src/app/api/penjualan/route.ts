// PENJUALAN API Route - Report INV data (FINAL FIXED SYNTAX)
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ReportInvData {
  no: number;
  tanggal: string;
  customer: string;
  pt: string;
  noPenawaran: string;
  noInvoice: string;
  subtotal: number;
  totalAfterDiscount: number;
  ppn: number;
  totalInvoice: number;
  totalSparepart: number;
  pengajuanModal: number;
  pembelianAktual: number;
  paymentStatus?: string;
  lunasDate?: string | null;
}

// GET: Report INV tersimpan dengan JOIN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    console.log("🔍 API penjualan:", search ? `search="${search}"` : "all");

    // Batch fetch
    const [
      reportInvs,
      penjualans,
      penawaransAll,
      modalCosts,
      modalAktualCosts,
      pengajuanModals,
      aktualModals,
      profits,
    ] = await Promise.all([
      prisma.reportInv.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.penjualan.findMany({
        select: {
          noInvoice: true,
          paymentStatus: true,
          lunasDate: true,
          bansos: true,
        },
      }),
      prisma.penawaran.findMany({
        select: { noPenawaran: true, pt: true, noQuo: true },
      }),
      prisma.modalCost.findMany(),
      prisma.modalAktualCost.findMany(),
      prisma.modal.findMany({
        where: { isAktual: false },
        select: { noPenawaran: true, amount: true },
      }),
      prisma.modal.findMany({
        where: { isAktual: true },
        select: { noQuo: true, amount: true },
      }),
      prisma.profit.findMany({
        select: { noQuo: true, bansosAktual: true },
      }),
    ]);

    console.log(
      `📊 Data: ReportInv=${reportInvs.length}, Penawaran=${penawaransAll.length}, ModalCost=${modalCosts.length}, PengajuanModals=${pengajuanModals.length}`,
    );

    const penjualanMap = new Map(
      penjualans.map((p) => [
        p.noInvoice.trim(),
        {
          paymentStatus: p.paymentStatus,
          lunasDate: p.lunasDate
            ? p.lunasDate.toISOString().split("T")[0]
            : null,
        },
      ]),
    );
    const penawaranMap = new Map(
      penawaransAll.map((p) => [p.noPenawaran.trim(), p]),
    );
    const modalCostMap = new Map(modalCosts.map((mc) => [mc.noQuo.trim(), mc]));
    const modalAktualCostMap = new Map(
      modalAktualCosts.map((mc) => [mc.noQuo.trim(), mc]),
    );
    const profitMap = new Map(
      profits.map((p) => [p.noQuo.trim(), p.bansosAktual]),
    );
    const safeSum = (fields: number[]) =>
      fields.reduce((sum, field) => sum + (field || 0), 0);
    const itemSubTotalMap = new Map();
    const itemSubTotalAktMap = new Map();
    pengajuanModals.forEach((m) => {
      if (m.noPenawaran) {
        const key = m.noPenawaran.trim();
        const current = itemSubTotalMap.get(key) || 0;
        itemSubTotalMap.set(key, current + Number(m.amount || 0));
      }
    });
    aktualModals.forEach((m) => {
      if (m.noQuo) {
        const key = m.noQuo.trim();
        const current = itemSubTotalAktMap.get(key) || 0;
        itemSubTotalAktMap.set(key, current + Number(m.amount || 0));
      }
    });

    console.log(
      "🔍 DEBUG - penawaranMap keys (trimmed):",
      Array.from(penawaranMap.keys()),
    );
    console.log(
      "🔍 DEBUG - modalCostMap keys (trimmed):",
      Array.from(modalCostMap.keys()),
    );

    const data: ReportInvData[] = [];
    reportInvs.forEach((ri, index) => {
      // DEBUG khusus noQuo=0002-PH (untuk investigasi bansos yang masih 0)
      // (Kondisi: jika noInvoice (noQuo) kandidat = 0002-PH)
      // Catatan: kita cek setelah noInvoice dihitung.

      const riKey = ri.noPenawaran.trim();
      console.log("🔍 DEBUG - Processing ri.noPenawaran (trim):", riKey);
      const penawaran = penawaranMap.get(riKey);

      console.log(
        "🔍 DEBUG - Found penawaran:",
        penawaran ? (penawaran as any).noQuo : "MISSING",
        (penawaran as any)?.noQuo,
      );

      const pt = (penawaran as any)?.pt || "Unknown";
      const noInvoice = (penawaran as any)?.noQuo || ri.noPenawaran;

      if (String(noInvoice).trim() === "0002-PH") {
        console.log("🧪 DEBUG Penjualan GET target noInvoice=0002-PH", {
          riNoPenawaran: ri.noPenawaran,
          penawaranNoQuo: (penawaran as any)?.noQuo,
          computedNoInvoice: noInvoice,
        });
      }

      // Format Customer sebagai multiline dari data ReportInv
      const customerLines = [
        ri.customerId || "",
        ri.pt || "",
        ri.kapal || "",
      ].filter(Boolean);
      const displayCustomer = customerLines.join("\n");

      console.log(
        `📋 ${ri.noPenawaran}: customer lines:\n${displayCustomer || pt}`,
      );

      // Filter pencarian
      const terms = [displayCustomer || pt, noInvoice, ri.noPenawaran]
        .map((s) => s.toLowerCase())
        .join(" ");
      if (search && !terms.includes(search)) return;

      const modalCost = penawaran
        ? modalCostMap.get((penawaran as any).noQuo.trim())
        : undefined;
      console.log(
        "🔍 DEBUG - modal lookup key:",
        (penawaran as any)?.noQuo?.trim(),
        "found:",
        modalCost ? "✓" : "MISSING",
        modalCost?.totalModalSperpart,
      );
      const itemSubTotal = Number(itemSubTotalMap.get(riKey) || 0);
      const modalCostFull = modalCosts.find(
        (c) => c.noQuo === (penawaran as any)?.noQuo,
      );
      const modalAktualCostFull = modalAktualCosts.find(
        (c) => c.noQuo === (penawaran as any)?.noQuo,
      );
      const totalCost = Number(
        modalCostFull
          ? safeSum([
              modalCostFull.bankCharge || 0,
              modalCostFull.packingCost || 0,
              modalCostFull.deliveryDutyTax || 0,
              modalCostFull.deliveryLocalCost || 0,
              modalCostFull.deliveryAirDHL || 0,
              modalCostFull.deliveryAirDoorToDoor || 0,
              modalCostFull.deliverySeaResmi || 0,
              modalCostFull.deliverySeaDoorToDoor || 0,
              modalCostFull.feeKurir || 0,
              modalCostFull.otherCostTruck || 0,
              modalCostFull.otherCostServiceBoat || 0,
              modalCostFull.otherCostLainLain || 0,
            ])
          : 0,
      );
      const totalCostAkt = Number(
        modalAktualCostFull
          ? safeSum([
              modalAktualCostFull.bankCharge || 0,
              modalAktualCostFull.packingCost || 0,
              modalAktualCostFull.deliveryDutyTax || 0,
              modalAktualCostFull.deliveryLocalCost || 0,
              modalAktualCostFull.deliveryAirDHL || 0,
              modalAktualCostFull.deliveryAirDoorToDoor || 0,
              modalAktualCostFull.deliverySeaResmi || 0,
              modalAktualCostFull.deliverySeaDoorToDoor || 0,
              modalAktualCostFull.feeKurir || 0,
              modalAktualCostFull.otherCostTruck || 0,
              modalAktualCostFull.otherCostServiceBoat || 0,
              modalAktualCostFull.otherCostLainLain || 0,
            ]) - (modalAktualCostFull.discount || 0)
          : 0,
      );
      const pengajuanModal = itemSubTotal + totalCost;
      const totalSparepart = Number(modalCostFull?.totalModalSperpart || 0);
      const itemSubAkt = Number(
        itemSubTotalAktMap.get((penawaran as any)?.noQuo?.trim() || "") || 0,
      );
      const pembelianAktual = itemSubAkt + totalCostAkt;

      const penjualanStatus = penjualanMap.get(noInvoice);

      // BANSOS: ambil dari Profit.bansosAktual, fallback ke penjualan.bansos
      const profitBansosAktual = penawaran ? profitMap.get((penawaran as any).noQuo.trim()) : null;
      const bansosValue = Math.round(
        Number(profitBansosAktual ?? (penjualanStatus as any)?.bansos ?? 0),
      );

      data.push({
        no: index + 1,
        tanggal: ri.createdAt.toISOString().split("T")[0],
        customer: displayCustomer,
        kapal: ri.kapal || "",
        pt,
        noPenawaran: ri.noPenawaran,
        noInvoice,
        noPo: ri.noPo || "",
        subtotal: Number(ri.subtotal || 0),
        totalAfterDiscount: Number(ri.totalAfterDiscount || 0),
        ppn: Number(ri.ppn || 0),
        totalInvoice: Number(ri.totalInvoice || 0),
        totalSparepart,
        pengajuanModal,
        pembelianAktual,
        paymentStatus: penjualanStatus?.paymentStatus,
        lunasDate: penjualanStatus?.lunasDate,
        bansosValue,
      } as any);
    });

    console.log(`📋 Return ${data.length} records`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Check logs", data: [] },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Lunas legacy
export async function POST(request: NextRequest) {
  const p = new PrismaClient();
  try {
    const { noInvoice, lunasDate } = await request.json();
    if (!noInvoice)
      return NextResponse.json({ error: "noInvoice needed" }, { status: 400 });

    await p.penjualan.updateMany({
      where: { noInvoice },
      data: {
        paymentStatus: "Lunas",
        lunasDate: new Date(lunasDate || Date.now()),
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  } finally {
    await p.$disconnect();
  }
}
