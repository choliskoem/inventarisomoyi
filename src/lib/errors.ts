import type { PostgrestError } from '@supabase/supabase-js';

/** Kesalahan yang pesannya aman ditampilkan ke pengguna. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

type ErrorMessages = Partial<Record<string, string>>;

const DEFAULT_MESSAGES: ErrorMessages = {
  '23505': 'Data dengan nama atau kode tersebut sudah ada.',
  '23503': 'Data masih digunakan oleh data lain.',
  '23514': 'Data tidak memenuhi aturan validasi.',
  '42501': 'Anda tidak memiliki akses ke data ini.',
  PGRST116: 'Data tidak ditemukan.',
};

/** Ubah error database menjadi AppError berpesan ramah. */
export function toAppError(error: PostgrestError, overrides: ErrorMessages = {}): AppError {
  // P0001 = raise exception dari fungsi/trigger kita sendiri, pesannya sudah ramah
  if (error.code === 'P0001') return new AppError(error.message);

  const message =
    overrides[error.code] ??
    DEFAULT_MESSAGES[error.code] ??
    'Terjadi kesalahan pada database. Silakan coba lagi.';
  return new AppError(message);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  console.error(error);
  return 'Terjadi kesalahan tak terduga. Silakan coba lagi.';
}