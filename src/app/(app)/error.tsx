'use client';

import { buttonClass } from '@/components/ui/button';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-semibold text-red-800">Terjadi kesalahan</h2>
      <p className="mt-1 text-sm text-red-700">Data gagal dimuat. Periksa koneksi Anda lalu coba lagi.</p>
      <button type="button" onClick={reset} className={buttonClass('secondary', 'sm', 'mt-4')}>
        Coba lagi
      </button>
    </div>
  );
}