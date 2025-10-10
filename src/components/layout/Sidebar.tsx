"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
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

const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Referidos", href: "/referrals", icon: Users },
  { name: "Análisis", href: "/analytics", icon: BarChart3 },
  { name: "Contactos", href: "/leads", icon: UserPlus },
  { name: "Inversiones", href: "/investments", icon: DollarSign },
  { name: "Calculadoras", href: "/calculators", icon: Calculator },
  { name: "Exportar", href: "/settings", icon: Settings },
] as const;

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil y manejar SSR
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Sincronizar estado colapsado con callback
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Cerrar sidebar móvil al cambiar ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => setIsMobileOpen(false);

  // Clases responsivas
  const sidebarClasses = cn(
    "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
    isMobile
      ? cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform",
          isMobileOpen ? "translate-x-0 w-54" : "-translate-x-full w-54"
        )
      : cn("relative h-full flex-shrink-0", isCollapsed ? "w-16" : "w-54")
  );

  const overlayClasses = cn(
    "fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity",
    isMobile && isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  );

  return (
    <>
      {/* Overlay para móvil */}
      <div
        className={overlayClasses}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Botón móvil */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white shadow-lg md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center px-3 border-b border-gray-200">
          <div
            className={cn(
              "flex items-center transition-all duration-200",
              isCollapsed && !isMobile ? "justify-center w-full" : "w-full"
            )}
          >
            <img
              src="/favicon.ico"
              alt="Bitnest"
              className="h-6 w-6 flex-shrink-0"
              style={{ objectFit: "contain" }}
            />
            {(!isCollapsed || isMobile) && (
              <span className="ml-2 text-lg font-bold text-gray-900 whitespace-nowrap">
                Bitnest
              </span>
            )}
          </div>

          {/* Botón colapsar (solo desktop) */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors ml-auto flex-shrink-0"
              aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const showText = !isCollapsed || isMobile;

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
                      showText ? "justify-start" : "justify-center"
                    )}
                    title={!showText ? item.name : ""}
                  >
                    <item.icon
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "h-4 w-4"
                      )}
                    />
                    {showText && (
                      <span className="ml-3 whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pie de página */}
        <div className="p-3 border-t border-gray-200">
          <div
            className={cn(
              "text-xs text-gray-500 text-center transition-opacity",
              !isCollapsed || isMobile ? "opacity-100" : "opacity-0"
            )}
          >
            Gestión Bitnest {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}
