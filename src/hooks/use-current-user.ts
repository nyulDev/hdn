"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/auth/actions";

interface CurrentUser {
  id: string;
  role: string | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  return { user, isLoading, isSuperAdmin: user?.role === "super_admin" };
}
