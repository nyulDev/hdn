import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noQuo, useBansos } = body as {
      noQuo?: string;
      useBansos?: boolean;
    };

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    if (typeof useBansos !== "boolean") {
      return NextResponse.json(
        { error: "useBansos (boolean) is required" },
        { status: 400 },
      );
    }

    const updated = await prisma.reportQuo.upsert({
      where: { noQuo: noQuo.trim() },
      update: { bansosUsed: useBansos },
      create: {
        noQuo: noQuo.trim(),
        bansosUsed: useBansos,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error saving bansosUsed:", error);
    return NextResponse.json(
      { error: "Failed to save bansosUsed" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
