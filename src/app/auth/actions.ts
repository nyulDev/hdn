"use server";

import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loginWithCookie(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (user && user.password === password.trim()) {
      if (user.status !== "active") {
        return { success: false, error: "User is not active" };
      }

      // Set cookie for session (valid for 1 day)
      const cookieStore = await cookies();
      cookieStore.set("auth_session", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      // Simpan role agar middleware bisa baca tanpa DB
      cookieStore.set("user_role", user.role ?? "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  cookieStore.delete("user_role");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_session")?.value;
  const role = cookieStore.get("user_role")?.value;
  if (!userId) return null;
  return { id: userId, role: role ?? null };
}
