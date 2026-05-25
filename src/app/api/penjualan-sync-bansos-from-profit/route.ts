import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/penjualan-sync-bansos-from-profit
// Tujuan: set Penjualan.bansos berdasar ReportQuo.bansosUsed.
// Rule: jika bansosUsed=true => bansos = totalAfterDiscount*5% else bansos=0
export async function POST() {
  try {
    // Ambil seluruh report inv (key: noPenawaran)
    const reportInvs = await prisma.reportInv.findMany({
      select: {
        noPenawaran: true,
        totalAfterDiscount: true,
      },
    });

    let total = reportInvs.length;
    let usedCount = 0;
    let updatedCount = 0;
    const sample: Array<{
      noPenawaran: string;
      noQuo: string;
      bansosUsed: boolean;
      totalAfterDiscount: number;
      bansosValue: number;
      updated: number;
    }> = [];

    for (const ri of reportInvs) {
      // Cari Penawaran yang terhubung ke noPenawaran
      const penawaran = await prisma.penawaran.findUnique({
        where: { noPenawaran: ri.noPenawaran },
        select: { noQuo: true },
      });

      if (!penawaran?.noQuo) continue;

      const reportQuo = await prisma.reportQuo.findUnique({
        where: { noQuo: penawaran.noQuo.trim() },
        select: { bansosUsed: true } as any,
      });

      const useBansos = !!reportQuo?.bansosUsed;
      const bansosValue = useBansos
        ? Math.round(Number(ri.totalAfterDiscount || 0) * 0.05 * 100) / 100
        : 0;

      const before = {
        noPenawaran: ri.noPenawaran,
        noQuo: penawaran.noQuo,
        bansosUsed: useBansos,
        totalAfterDiscount: ri.totalAfterDiscount,
        bansosValue,
      };

      const upd = await prisma.penjualan.updateMany({
        where: { noPenawaran: ri.noPenawaran },
        data: { bansos: bansosValue },
      });

      const updated = (upd as any)?.count ?? 0;
      if (useBansos) usedCount += 1;
      updatedCount += updated;

      if (sample.length < 10) {
        sample.push({
          ...before,
          updated,
        });
      }

      void updated;
    }

    return NextResponse.json(
      {
        ok: true,
        total,
        usedCount,
        updatedCount,
        sample,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("sync bansos error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
