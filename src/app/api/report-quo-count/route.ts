import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const reportQuos = await prisma.reportQuo.findMany({
      select: {
        noQuo: true,
      },
    });

    const uniqueNoQuoCount = new Set(reportQuos.map((r) => r.noQuo)).size;

    return NextResponse.json({ count: uniqueNoQuoCount });
  } catch (error) {
    console.error("Error fetching report-quo count:", error);
    return NextResponse.json(
      { error: "Failed to fetch report-quo count" },
      { status: 500 },
    );
  }
}
