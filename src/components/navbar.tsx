'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CarFront, ShieldCheck, Phone, UserCog, LogOut, User, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEALERSHIP_CONFIG } from '@/lib/dealership-config';

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUserEmail(data.user.email || null);
          setUserRole(data.user.user_metadata?.role || 'customer');
        } else {
          setUserEmail(null);
          setUserRole(null);
        }
      } catch {
        // Unconfigured or error
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || null);
        setUserRole(session.user.user_metadata?.role || 'customer');
      } else {
        setUserEmail(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setUserRole(null);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
            <CarFront className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Smart<span className="text-blue-600">Car</span>
            </span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pre-Owned
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#inventory"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Inventory
          </Link>
          <Link
            href="/#features"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            150-Point Inspection
          </Link>
          <Link
            href="/#finance"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Instant Finance
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <UserCog className="h-4 w-4 text-indigo-500" />
            Dealer CRM
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${DEALERSHIP_CONFIG.primaryPhone}`}
            className="hidden items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            <span>{DEALERSHIP_CONFIG.primaryPhone}</span>
          </a>

          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">{userEmail}</span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-blue-500/25"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
