// @ts-nocheck
'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';
import { useUI } from '@/lib/store/ui-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <div className="flex h-screen flex-col bg-gray-50 lg:flex-row dark:bg-slate-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-hidden bg-white lg:static lg:z-auto lg:transform-none dark:bg-slate-950 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
