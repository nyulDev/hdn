"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function addUser(data: any) {
  try {
    const { name, email, password, role, status } = data;
    
    // Create new user in database
    await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        status
      }
    });

    revalidatePath("/user-management");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const { name, email, password, role, status } = data;
    
    // Only update password if provided
    const updateData: any = { name, email, role, status };
    if (password && password.trim() !== "") {
      updateData.password = password.trim();
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/user-management");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/user-management");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message };
  }
}

export async function checkLogin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (user && user.password === password.trim()) {
      return { success: true, data: user };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}
