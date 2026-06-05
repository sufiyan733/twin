"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

// Routes where the bottom nav must NOT appear
const AUTH_ROUTES = ["/login", "/onboarding"];

export default function NavShell() {
  const pathname = usePathname();

  // Hide on auth routes (exact match or sub-paths)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAuthRoute) return null;

  return <BottomNav />;
}
