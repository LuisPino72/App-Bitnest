import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  compact?: boolean;
  centered?: boolean;
}

const MetricCard = React.memo<MetricCardProps>(
  ({
    title,
    value,
    change,
    changeType = "neutral",
    icon,
    compact = false,
    centered = false,
  }) => {
    const iconBgClass = cn("rounded-lg p-2", {
      "bg-green-100 text-green-600": changeType === "positive",
      "bg-red-100 text-red-600": changeType === "negative",
      "bg-gray-100 text-gray-600": changeType === "neutral",
    });

    const changeTextClass = cn(compact ? "text-xs" : "text-sm", {
      "text-green-600": changeType === "positive",
      "text-red-600": changeType === "negative",
      "text-gray-600": changeType === "neutral",
    });

    if (centered) {
      return (
        <div
          className={cn(
            "rounded-xl border bg-white shadow-sm p-6 flex flex-col justify-center items-center text-center h-full",
            compact && "p-4"
          )}
        >
          <div className={iconBgClass}>{icon}</div>
          <p
            className={cn(
              "text-gray-600 font-medium mt-3",
              compact ? "text-sm" : "text-base"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "font-bold text-gray-900 mt-1",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {value}
          </p>
          {change && <p className={cn("mt-1", changeTextClass)}>{change}</p>}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-xl border bg-white shadow-sm p-6",
          compact && "p-4"
        )}
      >
        <div className="flex items-center">
          <div className={iconBgClass}>{icon}</div>
          <div className="ml-3 flex-1">
            <p
              className={cn("text-gray-600", compact ? "text-sm" : "text-base")}
            >
              {title}
            </p>
            <p
              className={cn(
                "font-bold text-gray-900",
                compact ? "text-xl" : "text-2xl"
              )}
            >
              {value}
            </p>
            {change && <p className={changeTextClass}>{change}</p>}
          </div>
        </div>
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";

export default MetricCard;
