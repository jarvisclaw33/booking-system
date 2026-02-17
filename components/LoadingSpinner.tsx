import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ message = 'Lädt...', fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader className="h-8 w-8 text-blue-600 animate-spin dark:text-blue-400" />
      <p className="text-sm text-gray-600 dark:text-slate-400">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
