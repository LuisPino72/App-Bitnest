import React from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export const DashboardHeader = React.memo<DashboardHeaderProps>(
  ({ title, subtitle }) => {
    return (
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          {title}
        </h1>
        <p className="text-gray-500 text-base mt-2">{subtitle}</p>
      </div>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
