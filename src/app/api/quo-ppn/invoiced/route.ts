import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function PUT(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    const { items } = body as {
      items?: Array<{ id: string; invoicedQty: number }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid 'items' array in request body. Expected: [{ id, invoicedQty }]",
        },
        { status: 400 },
      );
    }

    // Execute updates sequentially to correctly compute remaining per row.
    // (Qty partial invoicing needs accumulation.)
    let updatedCount = 0;

    for (const item of items) {
      if (!item?.id) continue;

      const qtyToInvoice = Number(item.invoicedQty) || 0;
      if (qtyToInvoice <= 0) continue;

      const current = await prisma.quoPpn.findUnique({
        where: { id: item.id },
        select: { qty: true, invoicedQty: true },
      });

      if (!current) continue;

      const currentInvoicedQty = Number(current.invoicedQty) || 0;
      const totalAfter = currentInvoicedQty + qtyToInvoice;

      // Prevent over-invoicing beyond qty
      const clampedInvoicedQty = Math.min(totalAfter, Number(current.qty) || 0);

      const willBeFullyInvoiced =
        clampedInvoicedQty >= (Number(current.qty) || 0);

      await prisma.quoPpn.update({
        where: { id: item.id },
        data: {
          invoicedQty: clampedInvoicedQty,
          isInvoiced: willBeFullyInvoiced,
        },
      });

      updatedCount++;
    }

    return NextResponse.json({
      message: "Successfully updated invoiced quantities",
      count: updatedCount,
    });
  } catch (error) {
    console.error("Error updating invoiced status:", error);
    return NextResponse.json(
      { error: "Failed to update invoiced status" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
