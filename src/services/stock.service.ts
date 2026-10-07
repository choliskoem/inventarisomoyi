import { toAppError } from '@/lib/errors';
import type { DbClient } from '@/lib/supabase/server';
import type { MovementType, StockMovement } from '@/lib/types';
import type { MovementInput } from '@/lib/validation';

interface StockMovementRow {
  id: string;
  type: MovementType;
  quantity: number | string;
  note: string | null;
  created_at: string;
}

function toStockMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    type: row.type,
    quantity: Number(row.quantity),
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function listMovements(db: DbClient, itemId: string, limit = 100): Promise<StockMovement[]> {
  const { data, error } = await db
    .from('stock_movements')
    .select('id, type, quantity, note, created_at')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw toAppError(error);
  return (data as StockMovementRow[]).map(toStockMovement);
}

/** Stok keluar yang melebihi stok tersedia ditolak oleh trigger database. */
export async function recordMovement(db: DbClient, itemId: string, input: MovementInput): Promise<void> {
  const { error } = await db.from('stock_movements').insert({ item_id: itemId, ...input });
  if (error) throw toAppError(error, { '42501': 'Barang tidak ditemukan.' });
}