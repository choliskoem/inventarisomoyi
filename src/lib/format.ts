import { APP_LOCALE, APP_TIMEZONE } from './config';

const numberFormatter = new Intl.NumberFormat(APP_LOCALE, { maximumFractionDigits: 2 });

const dateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: APP_TIMEZONE,
});

const fileDateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: APP_TIMEZONE,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

/** Tanggal untuk nama file, mis. 2026-10-07 */
export function formatFileDate(value: Date): string {
  return fileDateFormatter.format(value);
}