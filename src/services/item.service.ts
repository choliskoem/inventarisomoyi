import { toAppError } from '@/lib/errors';
import type { DbClient } from '@/lib/supabase/server';
import type { ItemFilter, ItemOverview, StockStatus } from '@/lib/types';
import type { CreateItemInput, ItemInput } from '@/lib/validation';

const ITEM_ERRORS = {
  '23505': 'Kode barang sudah digunakan barang lain.',
  '23503': 'Kategori atau satuan yang dipilih tidak valid.',
  PGRST116: 'Barang tidak ditemukan.',
};

const ITEM_COLUMNS =
  'id, sku, name, description, min_stock, category_id, category_name, unit_id, unit_code, unit_name, quantity, stock_status, created_at, updated_at';

interface ItemOverviewRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  min_stock: number | string;
  category_id: string;
  category_name: string;
  unit_id: number;
  unit_code: string;
  unit_name: string;
  quantity: number | string;
  stock_status: StockStatus;
  created_at: string;
  updated_at: string;
}

function toItemOverview(row: ItemOverviewRow): ItemOverview {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    minStock: Number(row.min_stock),
    categoryId: row.category_id,
    categoryName: row.category_name,
    unitId: row.unit_id,
    unitCode: row.unit_code,
    unitName: row.unit_name,
    quantity: Number(row.quantity),
    stockStatus: row.stock_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Hapus karakter yang punya arti khusus di filter PostgREST. */
function sanitizeSearch(term: string): string {
  return term.replace(/[,()*%\\"':]/g, ' ').trim();
}

export async function listItems(db: DbClient, filter: ItemFilter = {}): Promise<ItemOverview[]> {
  let query = db.from('item_overview').select(ITEM_COLUMNS).order('category_name').order('name');

  if (filter.categoryId) query = query.eq('category_id', filter.categoryId);

  const term = filter.q ? sanitizeSearch(filter.q) : '';
  if (term) query = query.or(`name.ilike.*${term}*,sku.ilike.*${term}*`);

  const { data, error } = await query;
  if (error) throw toAppError(error);
  return (data as ItemOverviewRow[]).map(toItemOverview);
}

export async function listLowStockItems(db: DbClient, limit = 10): Promise<ItemOverview[]> {
  const { data, error } = await db
    .from('item_overview')
    .select(ITEM_COLUMNS)
    .neq('stock_status', 'ok')
    .order('quantity')
    .limit(limit);
  if (error) throw toAppError(error);
  return (data as ItemOverviewRow[]).map(toItemOverview);
}

export async function getItem(db: DbClient, id: string): Promise<ItemOverview | null> {
  const { data, error } = await db.from('item_overview').select(ITEM_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw toAppError(error);
  return data ? toItemOverview(data as ItemOverviewRow) : null;
}

/** Membuat barang beserta stok awalnya dalam satu transaksi (fungsi create_item). */
export async function createItem(db: DbClient, input: CreateItemInput): Promise<string> {
  const { data, error } = await db.rpc('create_item', {
    p_category_id: input.category_id,
    p_unit_id: input.unit_id,
    p_sku: input.sku,
    p_name: input.name,
    p_description: input.description,
    p_min_stock: input.min_stock,
    p_initial_quantity: input.initial_quantity,
  });
  if (error) throw toAppError(error, ITEM_ERRORS);
  return data as string;
}

export async function updateItem(db: DbClient, id: string, input: ItemInput): Promise<void> {
  const { error } = await db.from('items').update(input).eq('id', id).select('id').single();
  if (error) throw toAppError(error, ITEM_ERRORS);
}

export async function deleteItem(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from('items').delete().eq('id', id).select('id').single();
  if (error) throw toAppError(error, ITEM_ERRORS);
}