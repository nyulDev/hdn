import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/report-quo-bansos-sync-to-penjualan
// Tujuan: update field Penjualan.bansos berdasarkan ReportQuo.bansosUsed untuk noQuo yang punya record ReportInv.
export async function POST(_request: NextRequest) {
  try {
    // Ambil semua report inv (kunci noPenawaran)
    const reportInvs = await prisma.reportInv.findMany({
      select: {
        noPenawaran: true,
        totalAfterDiscount: true,
      },
    });

    const result: Array<{ noPenawaran: string; updated: boolean }> = [];

    for (const ri of reportInvs) {
      const noPenawaran = ri.noPenawaran;

      // noQuo pada flow ini berasal dari Penawaran.noQuo yang terhubung ke ReportInv.noPenawaran
      const penawaran = await prisma.penawaran.findUnique({
        where: { noPenawaran: noPenawaran },
        select: { noQuo: true },
      });

      if (!penawaran?.noQuo) {
        result.push({ noPenawaran, updated: false });
        continue;
      }

      const reportQuo = await prisma.reportQuo.findUnique({
        where: { noQuo: penawaran.noQuo },
        select: { bansosUsed: true } as any,
      });

      const useBansos = !!(reportQuo as any)?.bansosUsed;

      const bansosValue = useBansos
        ? Number(ri.totalAfterDiscount || 0) * 0.05
        : 0;

      await prisma.penjualan.updateMany({
        where: { noPenawaran: noPenawaran },
        data: {
          bansos: bansosValue,
        },
      });

      result.push({ noPenawaran, updated: true });
    }

    return NextResponse.json({ ok: true, items: result }, { status: 200 });
  } catch (error) {
    console.error("bansos sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync bansos" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
