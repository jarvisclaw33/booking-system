// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isMockMode } from '@/lib/utils/mock';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      if (isMockMode()) {
        router.push('/dashboard');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-slate-100">
          Buchungssystem
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-slate-400">
          Weiterleitung zum Dashboard...
        </p>
      </div>
    </main>
  );
}
