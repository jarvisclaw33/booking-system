import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      {children}
    </div>
  );
}
