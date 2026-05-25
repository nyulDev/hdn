// Report QUO API Route - For saving and retrieving report quo data
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET - Fetch report quo data by noQuo
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    if (!noQuo) {
      return NextResponse.json(
        { error: "noQuo parameter is required" },
        { status: 400 },
      );
    }

    const reportQuo = await prisma.reportQuo.findUnique({
      where: {
        noQuo: noQuo.trim(),
      },
    });

    if (!reportQuo) {
      return NextResponse.json(null);
    }

    return NextResponse.json(reportQuo);
  } catch (error) {
    console.error("Error fetching report-quo:", error);
    return NextResponse.json(
      { error: "Failed to fetch report-quo" },
      { status: 500 },
    );
  }
}

// POST - Create or Update report quo data
export async function POST(request: Request) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    const { noQuo, atsn, delivery, price, discount, note, sktd } = body;

    // Validate required fields
    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await prisma.reportQuo.findUnique({
      where: {
        noQuo: noQuo.trim(),
      },
    });

    let reportQuo;
    if (existingRecord) {
      // Update existing record
      reportQuo = await prisma.reportQuo.update({
        where: {
          noQuo: noQuo.trim(),
        },
        data: {
          atsn: atsn || null,
          delivery: delivery || null,
          price: price || null,
          discount: discount ? parseFloat(discount) : null,
          note: note || null,
          sktd: typeof sktd === "boolean" ? sktd : false,
        },
      });
    } else {
      // Create new record
      reportQuo = await prisma.reportQuo.create({
        data: {
          noQuo: noQuo.trim(),
          atsn: atsn || null,
          delivery: delivery || null,
          price: price || null,
          discount: discount ? parseFloat(discount) : null,
          note: note || null,
        },
      });
    }

    return NextResponse.json(reportQuo, { status: 201 });
  } catch (error) {
    console.error("Error saving report-quo:", error);
    return NextResponse.json(
      { error: "Failed to save report-quo" },
      { status: 500 },
    );
  }
}
