import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/actions/auth.actions';
import { AppNav } from '@/components/app-nav';
import { buttonClass } from '@/components/ui/button';
import { requireUser } from '@/lib/auth';
import { APP_NAME } from '@/lib/config';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">IB</span>
            {APP_NAME}
          </Link>
          <AppNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 md:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className={buttonClass('ghost', 'sm')}>
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}