// QUO PPN API Route - v10
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET all QuoPpn with optional filtering by noQuo
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");
    const noPenawaran = searchParams.get("noPenawaran");

    const where: any = {};
    if (noQuo) where.noQuo = { equals: noQuo.trim() };
    if (noPenawaran) where.noPenawaran = { equals: noPenawaran.trim() };

    const quoPpns = await prisma.quoPpn.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quoPpns, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching quo-ppn:", error);
    return NextResponse.json(
      { error: "Failed to fetch quo-ppn" },
      { status: 500 },
    );
  }
}

// POST create new QuoPpn
export async function POST(request: Request) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    const {
      tanggal,
      noQuo,
      noPt,
      noPenawaran,
      pn,
      description,
      kodeImpa,
      qty,
      satuan,
      unitPriceNew,
      totalNew,
    } = body;

    // Validate required fields (allow numeric 0)
    const parsedQty = qty === undefined || qty === null ? NaN : Number(qty);
    const parsedUnitPriceNew =
      unitPriceNew === undefined || unitPriceNew === null
        ? NaN
        : Number(unitPriceNew);
    const parsedTotalNew =
      totalNew === undefined || totalNew === null ? NaN : Number(totalNew);

    if (
      !noQuo ||
      !noPt ||
      !noPenawaran ||
      !satuan ||
      !Number.isFinite(parsedQty) ||
      !Number.isFinite(parsedUnitPriceNew) ||
      !Number.isFinite(parsedTotalNew)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const quoPpn = await prisma.quoPpn.create({
      data: {
        tanggal: tanggal ? new Date(tanggal) : null,
        noQuo,
        noPt,
        noPenawaran,
        pn: pn || "",
        description: description || "",
        kodeImpa: kodeImpa || null,
        qty: parseFloat(qty),
        satuan,
        unitPriceNew: parseFloat(unitPriceNew),
        totalNew: parseFloat(totalNew),
      },
    });

    return NextResponse.json(quoPpn, { status: 201 });
  } catch (error) {
    console.error("Error creating quo-ppn:", error);
    return NextResponse.json(
      { error: "Failed to create quo-ppn" },
      { status: 500 },
    );
  }
}
