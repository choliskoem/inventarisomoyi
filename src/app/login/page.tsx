import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = { title: 'Masuk' };

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white">
            IB
          </div>
          <h1 className="text-xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-500">Catat barang per kategori, pantau stok, export laporan.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Tautan konfirmasi tidak valid atau sudah kedaluwarsa. Silakan masuk atau daftar ulang.
            </p>
          )}
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}