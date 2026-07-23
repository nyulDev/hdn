import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");
    const noPenawaran = searchParams.get("noPenawaran");

    const where: any = {};
    if (noQuo) where.noQuo = noQuo;
    if (noPenawaran) where.noPenawaran = noPenawaran;
    const isAktual = searchParams.get("isAktual") === "true";
    if (isAktual) where.isAktual = true;

    const modals = await prisma.modal.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(modals);
  } catch (error) {
    console.error("Error fetching modals:", error);
    return NextResponse.json(
      { error: "Failed to fetch modals" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      customerId,
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

    // Store unitPrice directly
    const modal = await prisma.modal.create({
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
        customerId: customerId || null,
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

    return NextResponse.json(modal, { status: 201 });
  } catch (error) {
    console.error("Error creating modal:", error);
    return NextResponse.json(
      {
        error: "Failed to create modal",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
