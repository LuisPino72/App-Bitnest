import React from "react";
import { getGenerationColor, getGenerationLabel } from "@/lib/commissionUtils";
import { Generation } from "@/types";

interface GenerationBadgeProps {
  generation: Generation;
  className?: string;
}

export const GenerationBadge = React.memo<GenerationBadgeProps>(
  ({ generation, className = "" }) => {
    const colorClass = getGenerationColor(generation);
    const label = getGenerationLabel(generation);

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
      >
        {label}
      </span>
    );
  }
);

GenerationBadge.displayName = "GenerationBadge";
