import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      pt,
      kapal,
      noQuo,
      noPenawaran,
      pn,
      tanggal,
      departemen,
      namaMesin,
    } = body;

    if (!pt || !noQuo || !noPenawaran) {
      return NextResponse.json(
        { error: "PT, No. Quo and No. Penawaran are required" },
        { status: 400 },
      );
    }

    const penawaran = await prisma.penawaran.update({
      where: { id },
      data: {
        pt,
        kapal: kapal || null,
        noQuo,
        noPenawaran,
        pn: pn || null,
        tanggal: tanggal ? new Date(tanggal) : null,
        departemen: departemen || null,
        namaMesin: namaMesin || null,
      },
    });

    return NextResponse.json(penawaran);
  } catch (error) {
    console.error("Error updating penawaran:", error);
    return NextResponse.json(
      { error: "Failed to update penawaran" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    await prisma.penawaran.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting penawaran:", error);
    return NextResponse.json(
      { error: "Failed to delete penawaran" },
      { status: 500 },
    );
  }
}
