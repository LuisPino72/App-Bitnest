"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className="flex-1 min-w-0 overflow-auto transition-all duration-300">
        <div className="p-3 md:p-4 max-w-full">
          {" "}
          {children}
        </div>
      </div>
    </div>
  );
}
