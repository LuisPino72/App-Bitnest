"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  UserPlus,
  DollarSign,
  Calculator,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Referidos",
    href: "/referrals",
    icon: Users,
  },
  {
    name: "Análisis",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Contactos",
    href: "/leads",
    icon: UserPlus,
  },
  {
    name: "Inversiones",
    href: "/investments",
    icon: DollarSign,
  },
  {
    name: "Calculadoras",
    href: "/calculators",
    icon: Calculator,
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const mobileSidebarClass = isMobileOpen
    ? "translate-x-0"
    : "-translate-x-full";

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-blue-600 text-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          isMobile
            ? `fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${sidebarWidth} ${mobileSidebarClass}`
            : `relative h-full bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${sidebarWidth}`
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center px-3 border-b border-gray-200">
            <div
              className={cn(
                "flex items-center transition-opacity duration-200",
                isCollapsed ? "justify-center w-full" : "w-full"
              )}
            >
              {!isCollapsed ? (
                <>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <span className="ml-2 text-lg font-bold text-gray-900 whitespace-nowrap">
                    Bitnest MLM
                  </span>
                </>
              ) : (
                <TrendingUp className="h-6 w-6 text-blue-600" />
              )}
            </div>

            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors ml-auto"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto p-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "group flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blue-100 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        isCollapsed ? "justify-center" : ""
                      )}
                      title={isCollapsed ? item.name : ""}
                    >
                      <item.icon
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4 mr-3"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap text-sm">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-200">
            <div
              className={cn(
                "text-xs text-gray-500 transition-opacity duration-200",
                isCollapsed ? "text-center" : "text-center"
              )}
            >
              {!isCollapsed ? <>© Bitnest MLM</> : <>Bitnest</>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
