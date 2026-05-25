import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noQuo = searchParams.get("noQuo");

    if (!noQuo) {
      return NextResponse.json(
        { error: "noQuo parameter required" },
        { status: 400 },
      );
    }

    // Fetch modals (isAktual=true) for this noQuo
    const modals = await prisma.modal.findMany({
      where: {
        noQuo,
        isAktual: true,
      },
    });

    // Fetch modal-aktual-cost for this noQuo
    const modalCosts = await prisma.modalAktualCost.findMany({
      where: { noQuo },
    });

    const currentModalCost = modalCosts[0] || null;

    if (modals.length === 0) {
      return NextResponse.json({ totalModalAktual: 0 });
    }

    // Calculate exactly matching report/modal-aktual/page.tsx logic
    const subTotal = modals.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Extract costs from ModalAktualCost (matching page calculation)
    const totalDiscount = currentModalCost?.discount || 0;
    const totalBankCharge = currentModalCost?.bankCharge || 0;
    const totalPackingCost = currentModalCost?.packingCost || 0;
    // Prefer stored actual duty tax (deliveryDutyTax) when available.
    // Fallback to percent-based calculation for backward compatibility.
    const totalDeliveryDutyTax =
      currentModalCost?.deliveryDutyTax !== null &&
      currentModalCost?.deliveryDutyTax !== undefined
        ? currentModalCost.deliveryDutyTax || 0
        : ((currentModalCost?.deliveryDutyTaxPercent || 0) / 100) * subTotal;

    const totalDeliveryAirDHL = currentModalCost?.deliveryAirDHL || 0;
    const totalDeliveryAirDoorToDoor =
      currentModalCost?.deliveryAirDoorToDoor || 0;
    const totalDeliverySeaResmi = currentModalCost?.deliverySeaResmi || 0;
    const totalDeliverySeaDoorToDoor =
      currentModalCost?.deliverySeaDoorToDoor || 0;
    const totalDeliveryLocalCost = currentModalCost?.deliveryLocalCost || 0;
    const totalFeeKurir = currentModalCost?.feeKurir || 0;
    const totalOtherCostTruck = currentModalCost?.otherCostTruck || 0;
    const totalOtherCostServiceBoat =
      currentModalCost?.otherCostServiceBoat || 0;
    const totalOtherCostLainLain = currentModalCost?.otherCostLainLain || 0;
    const totalHsi = currentModalCost?.hsi || 0;

    const totalAllCost =
      -totalDiscount +
      totalBankCharge +
      totalPackingCost +
      totalDeliveryDutyTax +
      totalDeliveryAirDHL +
      totalDeliveryAirDoorToDoor +
      totalDeliverySeaResmi +
      totalDeliverySeaDoorToDoor +
      totalDeliveryLocalCost +
      totalFeeKurir +
      totalOtherCostTruck +
      totalOtherCostServiceBoat +
      totalOtherCostLainLain;

    const totalModal = subTotal + totalAllCost;

    return NextResponse.json({
      totalModalAktual: totalModal,
      debug: {
        // For verification
        subTotal,
        totalAllCost,
        totalDiscount,
        totalDeliveryDutyTax,
        totalHsi,
      },
    });
  } catch (error) {
    console.error("Error fetching modal-aktual report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
