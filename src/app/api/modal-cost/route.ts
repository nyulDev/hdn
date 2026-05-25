import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// GET - Fetch all ModalCosts or by noQuo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    const where = noQuo ? { noQuo } : {};

    const modalCosts = await prisma.modalCost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(modalCosts);
  } catch (error) {
    console.error("Error fetching modal costs:", error);
    return NextResponse.json(
      { error: "Failed to fetch modal costs" },
      { status: 500 },
    );
  }
}

// POST - Create or Update ModalCost (upsert by noQuo)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      noQuo,
      discount,
      totalModalSperpart,
      bankCharge,
      packingCost,
      deliveryDutyTaxPercent,
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
    } = body;

    // Compute actual deliveryDutyTax from percent
    const deliveryDutyTaxActual =
      totalModalSperpart && deliveryDutyTaxPercent
        ? (parseFloat(deliveryDutyTaxPercent) / 100) *
          parseFloat(totalModalSperpart)
        : 0;

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.modalCost.findUnique({
      where: { noQuo },
    });

    let modalCost;
    if (existing) {
      // Update existing
      modalCost = await prisma.modalCost.update({
        where: { noQuo },
        data: {
          discount: discount ? parseFloat(discount) : null,
          totalModalSperpart: totalModalSperpart
            ? parseFloat(totalModalSperpart)
            : null,
          bankCharge: bankCharge ? parseFloat(bankCharge) : null,
          packingCost: packingCost ? parseFloat(packingCost) : null,
          deliveryDutyTax: deliveryDutyTaxActual,
          deliveryDutyTaxPercent: deliveryDutyTaxPercent
            ? parseFloat(deliveryDutyTaxPercent)
            : null,
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
        },
      });
    } else {
      // Create new
      modalCost = await prisma.modalCost.create({
        data: {
          noQuo,
          discount: discount ? parseFloat(discount) : null,
          totalModalSperpart: totalModalSperpart
            ? parseFloat(totalModalSperpart)
            : null,
          bankCharge: bankCharge ? parseFloat(bankCharge) : null,
          packingCost: packingCost ? parseFloat(packingCost) : null,
          deliveryDutyTax: deliveryDutyTaxActual,
          deliveryDutyTaxPercent: deliveryDutyTaxPercent
            ? parseFloat(deliveryDutyTaxPercent)
            : null,
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
        },
      });
    }

    return NextResponse.json(modalCost, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Error saving modal cost:", error);
    return NextResponse.json(
      { error: "Failed to save modal cost" },
      { status: 500 },
    );
  }
}

// DELETE - Delete ModalCost by noQuo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    // Delete the modal cost by noQuo
    await prisma.modalCost.delete({
      where: { noQuo },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting modal cost:", error);
    return NextResponse.json(
      { error: "Failed to delete modal cost" },
      { status: 500 },
    );
  }
}
