interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  compact?: boolean;
  centered?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  compact = false,
  centered = false,
}: MetricCardProps) {
  const iconBgClass =
    changeType === "positive"
      ? "bg-success-100 text-success-600"
      : changeType === "negative"
      ? "bg-danger-100 text-danger-600"
      : "bg-gray-100 text-gray-600";

  if (centered) {
    return (
      <div
        className={`card ${
          compact ? "p-4" : "p-6"
        } flex flex-col justify-center items-center text-center h-full`}
      >
        <div className={`rounded-lg p-2 mb-3 ${iconBgClass}`}>{icon}</div>
        <p
          className={`text-gray-600 ${
            compact ? "text-sm" : "text-base"
          } font-medium`}
        >
          {title}
        </p>
        <p
          className={`font-bold text-gray-900 ${
            compact ? "text-xl" : "text-2xl"
          } mt-1`}
        >
          {value}
        </p>
        {change && (
          <p
            className={`mt-1 ${
              changeType === "positive"
                ? "text-success-600"
                : changeType === "negative"
                ? "text-danger-600"
                : "text-gray-600"
            } ${compact ? "text-xs" : "text-sm"}`}
          >
            {change}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`card ${compact ? "p-4" : "p-6"}`}>
      <div className={`flex items-center ${compact ? "mb-2" : "mb-4"}`}>
        <div className={`rounded-lg p-2 ${iconBgClass}`}>{icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-gray-600 ${compact ? "text-sm" : "text-base"}`}>
            {title}
          </p>
          <p
            className={`font-bold text-gray-900 ${
              compact ? "text-xl" : "text-2xl"
            }`}
          >
            {value}
          </p>
          {change && (
            <p
              className={`${
                changeType === "positive"
                  ? "text-success-600"
                  : changeType === "negative"
                  ? "text-danger-600"
                  : "text-gray-600"
              } ${compact ? "text-xs" : "text-sm"}`}
            >
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
