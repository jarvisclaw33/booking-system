import { ReactNode } from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-slate-700 ${className || 'h-12 w-12'}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
