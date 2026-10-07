import type { ExportFormat, ItemFilter } from '@/lib/types';
import { buttonClass } from './ui/button';

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'excel', label: 'Export Excel' },
  { format: 'pdf', label: 'Export PDF' },
];

function exportUrl(format: ExportFormat, filter: ItemFilter): string {
  const params = new URLSearchParams();
  if (filter.categoryId) params.set('category', filter.categoryId);
  if (filter.q) params.set('q', filter.q);
  const query = params.toString();
  return `/api/export/${format}${query ? `?${query}` : ''}`;
}

/** Tautan unduh laporan sesuai filter yang sedang aktif. */
export function ExportButtons({ filter = {} }: { filter?: ItemFilter }) {
  return (
    <>
      {FORMATS.map(({ format, label }) => (
        <a key={format} href={exportUrl(format, filter)} download className={buttonClass('secondary')}>
          {label}
        </a>
      ))}
    </>
  );
}