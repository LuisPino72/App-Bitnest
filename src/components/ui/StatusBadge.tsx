import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "completed" | "expired" | string;
  className?: string;
}

export const StatusBadge = React.memo<StatusBadgeProps>(
  ({ status, className = "" }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "active":
          return {
            label: "Activo",
            classes: "bg-green-100 text-green-800",
          };
        case "completed":
          return {
            label: "Completado",
            classes: "bg-blue-100 text-blue-800",
          };
        case "expired":
          return {
            label: "Expirado",
            classes: "bg-red-100 text-red-800",
          };
        default:
          return {
            label: status,
            classes: "bg-gray-100 text-gray-800",
          };
      }
    };

    const { label, classes } = getStatusConfig(status);

    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          classes,
          className
        )}
      >
        {label}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";
