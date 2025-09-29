// components/ui/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  compact?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon,
  compact = false 
}: MetricCardProps) {
  return (
    <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`flex items-center ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className={`rounded-lg p-2 ${
          changeType === 'positive' ? 'bg-success-100 text-success-600' :
          changeType === 'negative' ? 'bg-danger-100 text-danger-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'}`}>{title}</p>
          <p className={`font-bold text-gray-900 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {value}
          </p>
          {change && (
            <p className={`${
              changeType === 'positive' ? 'text-success-600' :
              changeType === 'negative' ? 'text-danger-600' :
              'text-gray-600'
            } ${compact ? 'text-xs' : 'text-sm'}`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}