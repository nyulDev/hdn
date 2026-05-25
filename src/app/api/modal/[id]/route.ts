import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// Fixed params handling for Next.js 16 - params is now a Promise
// Updated: 2024

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      pt,
      noQuo,
      noPenawaran,
      kodeImpa,
      pn,
      description,
      location,
      qty,
      satuan,
      unitPrice,
      amount,
      tanggal,
      isAktual,
      nilaiAktual,
      // Cost fields
      discount,
      totalModalSperpart,
      bankCharge,
      packingCost,
      deliveryDutyTax,
      deliveryAirDHL,
      deliveryAirDoorToDoor,
      deliverySeaResmi,
      deliverySeaDoorToDoor,
      deliveryLocalCost,
      feeKurir,
      otherCostTruck,
      otherCostServiceBoat,
      otherCostLainLain,
      hsi,
      namaToko,
      disc,
      onkir,
      layanan,
    } = body;

    // Validate required fields - allow 0 as valid value for numeric fields
    if (
      !noPenawaran ||
      !description ||
      !qty ||
      !satuan ||
      unitPrice === undefined ||
      unitPrice === null ||
      unitPrice === "" ||
      amount === "" ||
      amount === null ||
      amount === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "noPenawaran, description, qty, satuan, unitPrice, amount required",
        },
        { status: 400 },
      );
    }

    const penawaran = await prisma.penawaran.findUnique({
      where: { noPenawaran },
    });

    if (!penawaran) {
      return NextResponse.json(
        { error: `Penawaran with noPenawaran '${noPenawaran}' not found` },
        { status: 404 },
      );
    }

    const resolvedNoQuo = noQuo || penawaran.noQuo;
    if (!resolvedNoQuo) {
      return NextResponse.json(
        { error: "noQuo required (from body or penawaran)" },
        { status: 400 },
      );
    }

    const modal = await prisma.modal.update({
      where: { id },
      data: {
        pt: pt || null,
        noQuo: resolvedNoQuo,
        noPenawaran: noPenawaran,
        kodeImpa: kodeImpa || null,
        pn: pn || null,
        description,
        location: location || null,
        qty: parseFloat(qty),
        satuan,
        unitPrice: parseFloat(unitPrice),
        amount: parseFloat(amount),
        tanggal: tanggal ? new Date(tanggal + "T00:00:00.000Z") : null,
        isAktual: isAktual === true,
        nilaiAktual: nilaiAktual ? parseFloat(nilaiAktual) : null,
        // Cost fields
        discount: discount ? parseFloat(discount) : null,
        totalModalSperpart: totalModalSperpart
          ? parseFloat(totalModalSperpart)
          : null,
        bankCharge: bankCharge ? parseFloat(bankCharge) : null,
        packingCost: packingCost ? parseFloat(packingCost) : null,
        deliveryDutyTax: deliveryDutyTax ? parseFloat(deliveryDutyTax) : null,
        deliveryAirDHL: deliveryAirDHL ? parseFloat(deliveryAirDHL) : null,
        deliveryAirDoorToDoor: deliveryAirDoorToDoor
          ? parseFloat(deliveryAirDoorToDoor)
          : null,
        deliverySeaResmi: deliverySeaResmi
          ? parseFloat(deliverySeaResmi)
          : null,
        deliverySeaDoorToDoor: deliverySeaDoorToDoor
          ? parseFloat(deliverySeaDoorToDoor)
          : null,
        deliveryLocalCost: deliveryLocalCost
          ? parseFloat(deliveryLocalCost)
          : null,
        feeKurir: feeKurir ? parseFloat(feeKurir) : null,
        otherCostTruck: otherCostTruck ? parseFloat(otherCostTruck) : null,
        otherCostServiceBoat: otherCostServiceBoat
          ? parseFloat(otherCostServiceBoat)
          : null,
        otherCostLainLain: otherCostLainLain
          ? parseFloat(otherCostLainLain)
          : null,
        hsi: hsi ? parseFloat(hsi) : null,
        namaToko: namaToko || null,
        disc: disc ? parseFloat(disc) : null,
        onkir: onkir ? parseFloat(onkir) : null,
        layanan: layanan ? parseFloat(layanan) : null,
      },
    });

    return NextResponse.json(modal);
  } catch (error) {
    console.error("Error updating modal:", error);
    return NextResponse.json(
      {
        error: "Failed to update modal",
        details: error instanceof Error ? error.message : String(error),
      },
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
    await prisma.modal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting modal:", error);
    return NextResponse.json(
      { error: "Failed to delete modal" },
      { status: 500 },
    );
  }
}
