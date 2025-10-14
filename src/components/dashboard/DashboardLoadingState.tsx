import React from "react";

interface DashboardLoadingStateProps {
  title: string;
  subtitle?: string;
}

export const DashboardLoadingState = React.memo<DashboardLoadingStateProps>(
  ({ title, subtitle = "Cargando datos..." }) => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="text-gray-500 text-base mt-2 animate-pulse">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 animate-pulse rounded-xl h-28 shadow-lg"
            />
          ))}
        </div>
      </div>
    );
  }
);

DashboardLoadingState.displayName = "DashboardLoadingState";
