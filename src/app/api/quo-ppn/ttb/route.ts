import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, ttbQtyById } = body as {
      ids?: string[];
      ttbQtyById?: Record<string, number>;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    if (!ttbQtyById || typeof ttbQtyById !== "object") {
      return NextResponse.json(
        { error: "ttbQtyById is required" },
        { status: 400 },
      );
    }

    // Ambil current qty agar bisa tentukan isTtb berdasar ttbQty >= qty
    const quoItems = await prisma.quoPpn.findMany({
      where: { id: { in: ids } },
      select: { id: true, qty: true },
    });

    const updates = quoItems.map((item) => {
      const raw = ttbQtyById[item.id];
      const ttbQty = raw === undefined || raw === null ? null : Number(raw);
      return { id: item.id, qty: item.qty, ttbQty };
    });

    // Validasi sederhana
    for (const u of updates) {
      if (u.ttbQty === null || !Number.isFinite(u.ttbQty) || u.ttbQty <= 0) {
        return NextResponse.json(
          {
            error: `ttbQty for id=${u.id} must be a number > 0`,
          },
          { status: 400 },
        );
      }
      // allowed: ttbQty bisa <= qty, akumulasi akan dicek saat update
      if (u.ttbQty! > u.qty) {
        return NextResponse.json(
          {
            error: `ttbQty for id=${u.id} cannot exceed qty`,
          },
          { status: 400 },
        );
      }
    }

    // Update per id karena butuh ttbQty berbeda-beda
    // ttbQty disimpan sebagai akumulasi (previous + new)
    const results = await Promise.all(
      updates.map(async (u) => {
        // Ambil current ttbQty agar bisa akumulasi
        const current = await prisma.quoPpn.findUnique({
          where: { id: u.id },
          select: { ttbQty: true },
        });

        // Jika field belum ada/terisi (existing data), fallback ke 0
        const prevTtbQty = current?.ttbQty ?? 0;
        const nextTtbQty = prevTtbQty + u.ttbQty!;

        // pastikan tidak melebihi qty total
        const cappedTtbQty = Math.min(nextTtbQty, u.qty);

        return prisma.quoPpn.update({
          where: { id: u.id },
          data: {
            // field `ttbQty` baru, pastikan build berhasil jika belum ada di DB
            ...(typeof (prisma as any).quoPpn !== "undefined" && {
              ttbQty: cappedTtbQty,
            }),
            // fallback agar tetap bekerja walau ttbQty belum tersedia
            isTtb: cappedTtbQty >= u.qty,
          } as any,
        });
      }),
    );

    return NextResponse.json({
      success: true,
      count: results.length,
      ids,
    });
  } catch (error) {
    console.error("Error marking quo-ppn as TTB:", error);
    return NextResponse.json(
      { error: "Failed to update TTB status" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
