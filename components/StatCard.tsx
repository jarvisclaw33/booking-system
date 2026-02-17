interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
        </div>
        {icon && <div className="flex-shrink-0 text-gray-400 dark:text-slate-500">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-4 text-xs sm:text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'} Trend
        </div>
      )}
    </div>
  );
}
