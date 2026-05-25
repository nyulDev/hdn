import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNo: string }> },
) {
  const prisma = new PrismaClient();
  try {
    const { invoiceNo } = await params;
    if (!invoiceNo) {
      return NextResponse.json(
        { error: "invoiceNo is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { lunasDate } = body;

    if (!lunasDate) {
      return NextResponse.json(
        { error: "lunasDate is required" },
        { status: 400 },
      );
    }

    console.log("SOA Satuan lunas API called:", invoiceNo, lunasDate);

    let penjualan = await prisma.penjualan.findUnique({
      where: {
        noInvoice: invoiceNo,
      },
    });

    if (!penjualan) {
      // Fallback create like original route
      const penawaran = await prisma.penawaran.findFirst({
        where: { noPenawaran: invoiceNo },
      });

      const customer = await prisma.customer.findFirst();
      const customerId = customer?.id || null;

      if (!customerId) {
        return NextResponse.json(
          { error: "No valid customer found" },
          { status: 400 },
        );
      }

      penjualan = await prisma.penjualan.create({
        data: {
          tanggal: new Date(),
          customerId,
          noPenawaran: invoiceNo,
          noInvoice: invoiceNo,
          invoiceSebelumPajak: 0,
          ppnSktd: 0,
          invoiceAfterTax: 0,
          pengajuanModal: 0,
          pembelianAktual: 0,
          grossProfit: 0,
          marketingFee: 0,
          bansos: 0,
          bagiHasilHsi: 0,
          netProfit: 0,
          paymentStatus: "Lunas",
          lunasDate: new Date(lunasDate),
        },
      });
      console.log("Created Penjualan:", penjualan.noInvoice);
    } else {
      const updated = await prisma.penjualan.update({
        where: { id: penjualan.id },
        data: {
          paymentStatus: "Lunas",
          lunasDate: new Date(lunasDate),
        },
      });
      penjualan = updated;
    }

    console.log(
      "SOA Satuan lunas complete:",
      penjualan.paymentStatus,
      penjualan.lunasDate,
    );

    return NextResponse.json({ success: true, data: penjualan });
  } catch (error: any) {
    console.error("SOA Satuan lunas error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment status" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
