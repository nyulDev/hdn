// QUO PPN DELETE API Route - Creating PrismaClient instance
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// DELETE QuoPpn by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.quoPpn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quo-ppn:", error);
    return NextResponse.json(
      { error: "Failed to delete quo-ppn" },
      { status: 500 },
    );
  }
}

// PUT (Update) QuoPpn by id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      tanggal,
      noQuo,
      noPt,
      noPenawaran,
      pn,
      description,
      kodeImpa,
      // qty di request dianggap sebagai "qty yang di-invoice-kan" (increment), bukan set source qty
      qty,
      satuan,
      unitPriceNew,
      totalNew,
    } = body;

    const requestedInvoiceQty = qty ? parseFloat(qty) : 0;
    const safeRequestedQty = Number.isFinite(requestedInvoiceQty)
      ? requestedInvoiceQty
      : 0;

    const existing = await prisma.quoPpn.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "quo-ppn item not found" },
        { status: 404 },
      );
    }

    const originalQty = existing.qty ?? 0;
    const alreadyInvoicedQty = existing.invoicedQty ?? 0;
    const remainingQty = Math.max(0, originalQty - alreadyInvoicedQty);

    const cappedInvoiceQty = Math.min(
      Math.max(0, safeRequestedQty),
      remainingQty,
    );

    const nextInvoicedQty = alreadyInvoicedQty + cappedInvoiceQty;
    const nextIsInvoiced = nextInvoicedQty >= originalQty || remainingQty <= 0;

    const quoPpn = await prisma.quoPpn.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : null,
        noQuo: noQuo || "",
        noPt: noPt || "",
        noPenawaran: noPenawaran || "",
        pn: pn || "",
        description: description || "",
        kodeImpa: kodeImpa || null,
        // qty tidak diubah: qty tetap qty original
        invoicedQty: nextInvoicedQty,
        isInvoiced: nextIsInvoiced,
        satuan: satuan || "",
        unitPriceNew: unitPriceNew ? parseFloat(unitPriceNew) : 0,
        // totalNew mengikuti qty invoice yang baru diambil
        totalNew:
          cappedInvoiceQty * (unitPriceNew ? parseFloat(unitPriceNew) : 0),
      },
    });

    return NextResponse.json(quoPpn);
  } catch (error) {
    console.error("Error updating quo-ppn:", error);
    return NextResponse.json(
      { error: "Failed to update quo-ppn" },
      { status: 500 },
    );
  }
}
