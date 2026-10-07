import { STOCK_STATUS_LABEL } from '@/lib/config';
import type { StockStatus } from '@/lib/types';

const TONES: Record<StockStatus, string> = {
  ok: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  low: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  empty: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[status]}`}>
      {STOCK_STATUS_LABEL[status]}
    </span>
  );
}