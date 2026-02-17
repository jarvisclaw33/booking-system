import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 text-center dark:border-slate-800 dark:bg-slate-900">
      {icon && <div className="mb-4 flex justify-center text-gray-400 dark:text-slate-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
