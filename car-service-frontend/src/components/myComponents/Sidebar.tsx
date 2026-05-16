"use client";

import { usePathname } from "next/navigation";
import SidebarContent from "./SidebarContent";

export default function Sidebar() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  return (
    <aside className="hidden lg:block w-64 border-r h-screen sticky top-0 bg-white z-20 shrink-0">
      <SidebarContent />
    </aside>
  );
}