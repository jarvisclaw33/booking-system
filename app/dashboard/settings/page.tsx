// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { isMockMode } from '@/lib/utils/mock';
import { mockUser } from '@/lib/mock-data';

interface UserSettings {
  email?: string;
  createdAt?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        if (isMockMode()) {
          setSettings({
            email: mockUser.email,
            createdAt: mockUser.created_at,
          });
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setSettings({
            email: user.email,
            createdAt: user.created_at,
          });
        }
      } catch (error) {
        toast.error('Einstellungen konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      if (!isMockMode()) {
        await supabase.auth.signOut();
      }
      toast.success('Erfolgreich abgemeldet');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Abmeldung fehlgeschlagen');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (isMockMode()) {
        toast.success('Passwort-Rücksetzungs-Email gesendet');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(settings.email || '', {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) throw error;
      toast.success('Passwort-Rücksetzungs-Email gesendet');
    } catch (error) {
      toast.error('Passwort-Rücksetzung fehlgeschlagen');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Einstellungen</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
          Verwalte deine Kontoeinstellungen und Präferenzen
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Konto</h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-200 rounded dark:bg-slate-700" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                E-Mail-Adresse
              </label>
              <div className="mt-1 px-4 py-2 bg-gray-50 rounded-md text-sm text-gray-900 border border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700">
                {settings.email}
              </div>
            </div>

            {settings.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Mitglied seit
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-md text-sm text-gray-900 border border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700">
                  {new Date(settings.createdAt).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}

            <div>
              <Button onClick={handleChangePassword} variant="outline" className="w-full">
                Passwort ändern
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-slate-100">Präferenzen</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-slate-100">
              Designmodus
            </label>
            <ThemeToggle variant="full" label="Farbschema" />
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Wechsle zwischen hellem und dunklem Design.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100">
                E-Mail-Benachrichtigungen
              </label>
              <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">
                Benachrichtigungen über neue Buchungen erhalten
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/40">
        <h2 className="text-lg font-semibold text-red-900 mb-4 dark:text-red-200">Gefahrenzone</h2>

        <div className="space-y-3">
          <Button onClick={handleLogout} variant="destructive" className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
          <p className="text-xs text-red-700 dark:text-red-300">
            Deine Sitzung wird beendet und du wirst zur Login-Seite weitergeleitet.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6 dark:border-blue-900/40 dark:bg-blue-950/40">
        <h3 className="text-sm font-medium text-blue-900 mb-2 dark:text-blue-200">Info</h3>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Version: 1.0.0 | Status: Beta | Entwicklung von Booking System Team
        </p>
      </div>
    </div>
  );
}
