// Report INV API Route - For saving and retrieving report inv data
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch report inv data by noPenawaran
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noPenawaran = searchParams.get("noPenawaran");

    if (!noPenawaran) {
      return NextResponse.json(
        { error: "noPenawaran parameter is required" },
        { status: 400 },
      );
    }

    const reportInv = await prisma.reportInv.findUnique({
      where: {
        noPenawaran: noPenawaran.trim(),
      },
    });

    if (!reportInv) {
      return NextResponse.json(null);
    }

    return NextResponse.json(reportInv);
  } catch (error) {
    console.error("Error fetching report-inv:", error);
    return NextResponse.json(
      { error: "Failed to fetch report-inv" },
      { status: 500 },
    );
  }
}

// POST - Create or Update report inv data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      noPenawaran,
      atsn,
      noPo,
      discount,

      location,
      pn,
      kapal,
      namaMesin,
      subtotal,
      discountAmount,
      totalAfterDiscount,
      dpp,
      ppn,
      totalInvoice,
      customerId,
      pt,
    } = body;

    // Validate required fields
    if (!noPenawaran) {
      return NextResponse.json(
        { error: "noPenawaran is required" },
        { status: 400 },
      );
    }

    // Check if record exists
    const existingRecord = await prisma.reportInv.findUnique({
      where: {
        noPenawaran: noPenawaran.trim(),
      },
    });

    let reportInv;
    if (existingRecord) {
      // Update existing record
      reportInv = await prisma.reportInv.update({
        where: {
          noPenawaran: noPenawaran.trim(),
        },
        data: {
          atsn: atsn || null,
          discount: discount ? parseFloat(discount) : null,
          location: location || null,
          pn: pn || null,
          kapal: kapal || null,
          namaMesin: namaMesin || null,
          subtotal: subtotal ? parseFloat(subtotal) : null,
          discountAmount: discountAmount ? parseFloat(discountAmount) : null,
          totalAfterDiscount: totalAfterDiscount
            ? parseFloat(totalAfterDiscount)
            : null,
          dpp: dpp ? parseFloat(dpp) : null,
          ppn: ppn ? parseFloat(ppn) : null,
          totalInvoice: totalInvoice ? parseFloat(totalInvoice) : null,
          customerId: customerId || null,
          pt: pt || null,
        },
      });
    } else {
      // Create new record
      reportInv = await prisma.reportInv.create({
        data: {
          noPenawaran: noPenawaran.trim(),
          atsn: atsn || null,
          discount: discount ? parseFloat(discount) : null,
          location: location || null,
          pn: pn || null,
          kapal: kapal || null,
          namaMesin: namaMesin || null,
          subtotal: subtotal ? parseFloat(subtotal) : null,
          discountAmount: discountAmount ? parseFloat(discountAmount) : null,
          totalAfterDiscount: totalAfterDiscount
            ? parseFloat(totalAfterDiscount)
            : null,
          dpp: dpp ? parseFloat(dpp) : null,
          ppn: ppn ? parseFloat(ppn) : null,
          totalInvoice: totalInvoice ? parseFloat(totalInvoice) : null,
          customerId: customerId || null,
          pt: pt || null,
        },
      });
    }

    return NextResponse.json(reportInv, { status: 201 });
  } catch (error) {
    console.error("Error saving report-inv:", error);
    return NextResponse.json(
      { error: "Failed to save report-inv" },
      { status: 500 },
    );
  }
}
