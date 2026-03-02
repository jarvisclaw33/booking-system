// @ts-nocheck
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { isMockMode } from '@/lib/utils/mock';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isMockMode()) {
        toast.success('Demo-Anmeldung aktiv');
        router.push('/dashboard');
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Detaillierte Fehlermeldungen
        const errorMessages: Record<string, string> = {
          'Invalid login credentials': 'E-Mail oder Passwort ist falsch',
          'User not found': 'Kein Konto mit dieser E-Mail-Adresse gefunden',
          'Email not confirmed': 'Bitte bestätige zuerst deine E-Mail-Adresse',
          'Invalid email': 'Bitte gib eine gültige E-Mail-Adresse ein',
        };
        
        const customMessage = errorMessages[error.message] || error.message;
        toast.error(customMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Erfolgreich angemeldet!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-slate-100">
            Anmelden
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-slate-400">
            Geben Sie Ihre Anmeldedaten ein
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird angemeldet...
                </>
              ) : isMockMode() ? (
                'Demo starten'
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Noch kein Konto?{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-300">
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
