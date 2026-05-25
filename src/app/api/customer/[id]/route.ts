import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// Fixed params handling for Next.js 16 - params is now a Promise

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerId, ptMv, alamat, kontak, kapal } = body;

    if (!customerId || !ptMv) {
      return NextResponse.json(
        { error: "Customer ID and PT/MV are required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        customerId,
        ptMv,
        alamat: alamat || null,
        kontak: kontak || null,
        kapal: kapal || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await paramsPromise;
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
