"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";

// Routes where the bottom nav must NOT appear
const HIDDEN_ROUTES = ["/login", "/onboarding", "/notes", "/workout-record"];

export default function NavShell() {
  const pathname = usePathname();

  // Hide on certain routes (exact match or sub-paths)
  const isHiddenRoute = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isHiddenRoute) return null;

  return <BottomNav />;
}
