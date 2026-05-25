import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"],
});

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, ptMv, alamat, kontak, kapal } = body;

    if (!customerId || !ptMv) {
      return NextResponse.json(
        { error: "Customer ID and PT/MV are required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.create({
      data: {
        customerId,
        ptMv,
        alamat: alamat || null,
        kontak: kontak || null,
        kapal: kapal || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer", details: String(error) },
      { status: 500 },
    );
  }
}
