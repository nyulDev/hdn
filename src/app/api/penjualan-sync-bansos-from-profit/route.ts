import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/penjualan-sync-bansos-from-profit
// Body (disarankan): { noQuo?: string }
// Tujuan: set Penjualan.bansos berdasar ReportQuo.bansosUsed.
// Rule (AKTUAL / sama seperti Profit checkbox):
// jika bansosUsed=true => bansos = Math.round((aktual/1.15)*0.05) else 0
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      noQuo?: string;
    };

    const noQuo = body?.noQuo ? String(body.noQuo).trim() : undefined;

    console.log("sync bansos request body", { body, noQuo });

    if (!noQuo) {
      // fallback: kalau tidak kirim noQuo, sync dari seluruh data (legacy)
      // namun untuk performa & akurasi, lebih baik selalu kirim noQuo dari /profit.
    }

    const reportQuo = noQuo
      ? await prisma.reportQuo.findUnique({
          where: { noQuo },
          select: { bansosUsed: true },
        })
      : null;

    if (noQuo && !reportQuo) {
      return NextResponse.json(
        { ok: true, updatedCount: 0, reason: "reportQuo not found" },
        { status: 200 },
      );
    }

    // Cara update yang lebih tepat: ikuti alur dari Profit (noQuo)
    // 1) cari Penawaran berdasarkan Penawaran.noQuo = noQuo
    // 2) cari ReportInv berdasarkan ReportInv.noPenawaran = Penawaran.noPenawaran
    // 3) update Penjualan berdasarkan Penjualan.noPenawaran = ReportInv.noPenawaran

    const penawarans = noQuo
      ? await prisma.penawaran.findMany({
          where: { noQuo },
          select: { noPenawaran: true },
        })
      : await prisma.penawaran.findMany({
          select: { noPenawaran: true },
        });

    let usedCount = 0;
    let updatedCount = 0;

    const sample: Array<{
      noPenawaran: string;
      noQuo: string;
      bansosUsed: boolean;
      totalAfterDiscount: number;
      bansosValue: number;
      updated: number;
      noInvoiceKey: string;
    }> = [];

    for (const p of penawarans) {
      if (!p.noPenawaran) continue;

      // Penting: beberapa nilai noPenawaran mengandung whitespace (tab/spasi)
      // sehingga findUnique gagal -> riFound=false.
      const normalizeKey = (s: any) =>
        String(s ?? "")
          .trim()
          .replace(/\s+/g, " ");

      const noPenawaranNorm = normalizeKey(p.noPenawaran);

      // Untuk menghindari mismatch, kita juga normalisasi key untuk noInvoice candidate
      const noQuoNorm = String(noQuo).replace(/\s+/g, " ");

      const noPenawaranTrim = String(p.noPenawaran).trim();

      const ri = await prisma.reportInv.findUnique({
        where: { noPenawaran: noPenawaranTrim },
        select: { totalAfterDiscount: true },
      });

      const aktual = Number(ri?.totalAfterDiscount || 0);

      const bansosUsed = noQuo ? !!reportQuo?.bansosUsed : false;
      const bansosValue = bansosUsed ? Math.round((aktual / 1.15) * 0.05) : 0;

      // Debug supaya kelihatan kenapa updatedCount bisa 0
      console.log("sync bansos detail", {
        noQuo,
        noPenawaran: p.noPenawaran,
        riFound: !!ri,
        riTotalAfterDiscount: ri?.totalAfterDiscount,
        bansosUsed,
        bansosValue,
        updateKeyNoInvoice: noQuo,
      });

      // Update berdasarkan key yang dipakai saat GET /api/penjualan
      // GET membuat noInvoice = (penawaran.noQuo) sehingga idealnya update ke penjualan.noInvoice
      // Debug match count sebelum update
      const noQuoCandidate = String(noQuo).trim();
      const countByNoInvoice = await prisma.penjualan.count({
        where: { noInvoice: noQuoCandidate },
      });
      const countByNoPenawaran = await prisma.penjualan.count({
        where: { noPenawaran: noPenawaranTrim },
      });

      // Extra debug: cek Penjualan yang match by noPenawaran & by noInvoice
      const penjualanByNoPenawaran = await prisma.penjualan.findMany({
        where: { noPenawaran: noPenawaranTrim },
        select: { noInvoice: true, noPenawaran: true, bansos: true },
        take: 5,
      });

      const penjualanByNoInvoice = await prisma.penjualan.findMany({
        where: { noInvoice: noQuoCandidate },
        select: { noInvoice: true, noPenawaran: true, bansos: true },
        take: 5,
      });

      const penjualanSample = await prisma.penjualan.findMany({
        where: {
          OR: [{ noInvoice: noQuoCandidate }, { noPenawaran: noPenawaranTrim }],
        },
        select: { noInvoice: true, noPenawaran: true, bansos: true },
        take: 5,
      });

      console.log("sync bansos match counts before update", {
        noQuoCandidate,
        noPenawaranTrim,
        countByNoInvoice,
        countByNoPenawaran,
        penjualanByNoPenawaran,
        penjualanByNoInvoice,
        penjualanSample,
      });

      // If Penjualan row doesn't exist, create minimal record so bansos can be stored.
      // Ini mengikuti skema minimal yang dipakai di /api/soa-satuan/lunas/[invoiceNo].
      if (countByNoInvoice === 0 && countByNoPenawaran === 0) {
        // Ambil customer default (seperti fallback di route SOA lunas)
        const customer = await prisma.customer.findFirst();
        if (customer?.id) {
          await prisma.penjualan.create({
            data: {
              tanggal: new Date(),
              customerId: customer.id,
              noPenawaran: noPenawaranTrim,
              noInvoice: noQuoCandidate,
              invoiceSebelumPajak: 0,
              ppnSktd: 0,
              invoiceAfterTax: 0,
              pengajuanModal: 0,
              pembelianAktual: 0,
              grossProfit: 0,
              marketingFee: 0,
              bansos: bansosValue,
              bagiHasilHsi: 0,
              netProfit: 0,
              paymentStatus: "Belum Lunas",
              lunasDate: null,
            },
          });
          updatedCount += bansosUsed ? 1 : 0;
        }
      }

      // Attempt 1: update by Penjualan.noInvoice
      let upd = await prisma.penjualan.updateMany({
        where: {
          // Penjualan.noInvoice adalah unique, tapi beberapa data bisa punya whitespace
          // jadi selalu trim input untuk memastikan match.
          noInvoice: noQuoCandidate,
        },
        data: { bansos: bansosValue },
      });

      let updated = (upd as any)?.count ?? 0;

      console.log("sync bansos update noInvoice", {
        noQuo,
        bansosValue,
        updated,
      });

      // Attempt 2 (fallback): update by Penjualan.noPenawaran
      // NOTE: Penjualan.noPenawaran mungkin punya trailing whitespace,
      // jadi kita coba beberapa variasi.

      // Ini untuk menghindari kasus mismatch skema antara penjualan.noInvoice vs penjualan.noPenawaran.
      if (updated === 0) {
        upd = await prisma.penjualan.updateMany({
          where: {
            // pastikan match string exact (trim) untuk kasus whitespace
            noPenawaran: noPenawaranTrim,
          },
          data: { bansos: bansosValue },
        });

        // Extra debug: cek apakah sebenarnya key yang dinormalisasi bisa match
        // (catatan: prisma tetap butuh nilai exact, jadi ini hanya untuk log)
        console.log("sync bansos debug noPenawaran normalized", {
          noQuo,
          noPenawaranRaw: p.noPenawaran,
          noPenawaranTrim,
          noPenawaranNorm,
        });

        updated = (upd as any)?.count ?? 0;

        console.log("sync bansos update noPenawaran fallback", {
          noQuo,
          noPenawaranTrim,
          bansosValue,
          updated,
        });
      }

      if (bansosUsed) usedCount += 1;
      updatedCount += updated;

      if (sample.length < 10) {
        const noInvoiceKey = String(noQuo ?? "").trim();
        sample.push({
          noPenawaran: p.noPenawaran,
          noQuo: noQuo || "",
          noInvoiceKey,
          bansosUsed,
          totalAfterDiscount: aktual,
          bansosValue,
          updated,
        });
      }
    }

    return NextResponse.json(
      {
        ok: true,
        updatedCount,
        usedCount,
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
