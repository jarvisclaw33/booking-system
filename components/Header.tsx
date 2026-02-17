'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUI } from '@/lib/store/ui-context';
import { isMockMode } from '@/lib/utils/mock';
import { mockUser } from '@/lib/mock-data';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();
  const { setSidebarOpen, sidebarOpen } = useUI();

  useEffect(() => {
    const fetchUser = async () => {
      if (isMockMode()) {
        setUserEmail(mockUser.email);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };

    fetchUser();
  }, [supabase]);

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
      return;
    }
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800 dark:bg-slate-950">
      <button
        onClick={handleMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-6 w-6" />
      </button>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Dashboard</h2>

      <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{userEmail}</span>
          <span className="sm:hidden truncate">{userEmail?.split('@')[0]}</span>
        </div>
      </div>
    </div>
  );
}
