import { MapPin, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationCardProps {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function LocationCard({
  id,
  name,
  address,
  timezone,
  onEdit,
  onDelete,
}: LocationCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <MapPin className="mt-1 h-5 w-5 text-blue-600 flex-shrink-0 dark:text-blue-400" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate dark:text-slate-100">{name}</h3>
            {address && (
              <p className="mt-1 text-sm text-gray-600 truncate dark:text-slate-400">{address}</p>
            )}
            {timezone && (
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Zeitzone: {timezone}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(id)}
              className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
              title="Bearbeiten"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              title="Löschen"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
