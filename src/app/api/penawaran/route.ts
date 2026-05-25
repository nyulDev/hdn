import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// API Route for Penawaran CRUD operations
// Added tanggal field support - 2024-02-06 v2
// Updated to use PrismaClient directly - v3

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const penawarans = await prisma.penawaran.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(penawarans);
  } catch (error) {
    console.error("Error fetching penawarans:", error);
    return NextResponse.json(
      { error: "Failed to fetch penawarans" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
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

    const penawaran = await prisma.penawaran.create({
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

    return NextResponse.json(penawaran, { status: 201 });
  } catch (error) {
    console.error("Error creating penawaran:", error);
    return NextResponse.json(
      { error: "Failed to create penawaran" },
      { status: 500 },
    );
  }
}
