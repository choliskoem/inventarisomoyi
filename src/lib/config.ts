export const APP_NAME = 'Inventaris Barang';
export const APP_LOCALE = 'id-ID';
export const APP_TIMEZONE = 'Asia/Jakarta';

export const DEFAULT_REDIRECT = '/dashboard';
export const PUBLIC_PATHS = ['/login', '/auth'] as const;

export const STOCK_STATUS_LABEL = {
  ok: 'Aman',
  low: 'Menipis',
  empty: 'Habis',
} as const;

export const MOVEMENT_TYPE_LABEL = {
  in: 'Masuk',
  out: 'Keluar',
} as const;