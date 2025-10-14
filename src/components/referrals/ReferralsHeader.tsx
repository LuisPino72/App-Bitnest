import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralsHeaderProps {
  onAddReferral: () => void;
}

export const ReferralsHeader = React.memo<ReferralsHeaderProps>(
  ({ onAddReferral }) => {
    return (
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Referidos
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Gestiona tu red de referidos y sus inversiones
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={onAddReferral} className="font-bold text-base">
            <Plus className="h-5 w-5 mr-2" />
            Nueva inversión
          </Button>
        </div>
      </div>
    );
  }
);

ReferralsHeader.displayName = "ReferralsHeader";
