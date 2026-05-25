import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

// DELETE - Delete ModalCost by id
export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await paramsPromise;
    await prisma.modalCost.delete({
      where: { id },
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
