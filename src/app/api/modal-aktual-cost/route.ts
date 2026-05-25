import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// GET - Fetch all ModalAktualCosts or by noQuo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    const where = noQuo ? { noQuo } : {};

    const modalCosts = await prisma.modalAktualCost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(modalCosts);
  } catch (error) {
    console.error("Error fetching modal aktual costs:", error);
    return NextResponse.json(
      { error: "Failed to fetch modal aktual costs" },
      { status: 500 },
    );
  }
}

// POST - Create or Update ModalAktualCost (upsert by noQuo)
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
    } = body;

    // Compute deliveryDutyTaxActual from either percent OR direct actual amount
    // - UI currently posts deliveryDutyTax as an actual nominal (not percent)
    // - Report endpoint may rely on percent; we store both when possible.
    const totalModalSperpartNum =
      totalModalSperpart !== undefined && totalModalSperpart !== null
        ? parseFloat(totalModalSperpart)
        : 0;

    const deliveryDutyTaxPercentNum =
      deliveryDutyTaxPercent !== undefined && deliveryDutyTaxPercent !== null
        ? parseFloat(deliveryDutyTaxPercent)
        : null;

    const deliveryDutyTaxActualFromPercent =
      totalModalSperpartNum && deliveryDutyTaxPercentNum !== null
        ? (deliveryDutyTaxPercentNum / 100) * totalModalSperpartNum
        : null;

    const deliveryDutyTaxActualNum =
      deliveryDutyTax !== undefined && deliveryDutyTax !== null
        ? parseFloat(deliveryDutyTax)
        : null;

    const deliveryDutyTaxActual =
      deliveryDutyTaxActualNum !== null
        ? deliveryDutyTaxActualNum
        : deliveryDutyTaxActualFromPercent !== null
          ? deliveryDutyTaxActualFromPercent
          : 0;

    const deliveryDutyTaxPercentComputed =
      deliveryDutyTaxActual && totalModalSperpartNum
        ? (deliveryDutyTaxActual / totalModalSperpartNum) * 100
        : null;

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.modalAktualCost.findUnique({
      where: { noQuo },
    });

    let modalCost;
    if (existing) {
      // Update existing
      modalCost = await prisma.modalAktualCost.update({
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
      modalCost = await prisma.modalAktualCost.create({
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
    console.error("Error saving modal aktual cost:", error);
    return NextResponse.json(
      { error: "Failed to save modal aktual cost" },
      { status: 500 },
    );
  }
}

// DELETE - Delete ModalAktualCost by noQuo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    if (!noQuo) {
      return NextResponse.json({ error: "noQuo is required" }, { status: 400 });
    }

    // Delete the modal aktual cost by noQuo
    await prisma.modalAktualCost.delete({
      where: { noQuo },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting modal aktual cost:", error);
    return NextResponse.json(
      { error: "Failed to delete modal aktual cost" },
      { status: 500 },
    );
  }
}
