// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { isMockMode } from '@/lib/utils/mock';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    try {
      if (isMockMode()) {
        toast.success('Demo-Konto erstellt!');
        router.push('/dashboard');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Konto erstellt! Überprüfen Sie Ihre E-Mail zur Bestätigung.');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-slate-100">
            Konto erstellen
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-slate-400">
            Registrieren Sie sich, um loszulegen
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                E-Mail-Adresse
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Passwort bestätigen
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Konto wird erstellt...' : isMockMode() ? 'Demo starten' : 'Registrieren'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Haben Sie bereits ein Konto?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-300">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
