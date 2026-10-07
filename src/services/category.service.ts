import { toAppError } from '@/lib/errors';
import type { DbClient } from '@/lib/supabase/server';
import type { CategoryOption, CategorySummary } from '@/lib/types';
import type { CategoryInput } from '@/lib/validation';

const CATEGORY_ERRORS = {
  '23505': 'Nama kategori sudah digunakan.',
  '23503': 'Kategori masih berisi barang. Pindahkan atau hapus barangnya terlebih dahulu.',
  PGRST116: 'Kategori tidak ditemukan.',
};

interface CategorySummaryRow {
  category_id: string;
  category_name: string;
  description: string | null;
  item_count: number;
  total_quantity: number | string;
  low_stock_count: number;
}

function toCategorySummary(row: CategorySummaryRow): CategorySummary {
  return {
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
    itemCount: row.item_count,
    totalQuantity: Number(row.total_quantity),
    lowStockCount: row.low_stock_count,
  };
}

export async function listCategoryOptions(db: DbClient): Promise<CategoryOption[]> {
  const { data, error } = await db.from('categories').select('id, name').order('name');
  if (error) throw toAppError(error);
  return data;
}

export async function listCategorySummaries(db: DbClient): Promise<CategorySummary[]> {
  const { data, error } = await db
    .from('category_summary')
    .select('category_id, category_name, description, item_count, total_quantity, low_stock_count')
    .order('category_name');
  if (error) throw toAppError(error);
  return (data as CategorySummaryRow[]).map(toCategorySummary);
}

export async function getCategoryName(db: DbClient, id: string): Promise<string | null> {
  const { data, error } = await db.from('categories').select('name').eq('id', id).maybeSingle();
  if (error) throw toAppError(error);
  return data?.name ?? null;
}

export async function createCategory(db: DbClient, input: CategoryInput): Promise<void> {
  const { error } = await db.from('categories').insert(input);
  if (error) throw toAppError(error, CATEGORY_ERRORS);
}

export async function updateCategory(db: DbClient, id: string, input: CategoryInput): Promise<void> {
  const { error } = await db.from('categories').update(input).eq('id', id).select('id').single();
  if (error) throw toAppError(error, CATEGORY_ERRORS);
}

export async function deleteCategory(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from('categories').delete().eq('id', id).select('id').single();
  if (error) throw toAppError(error, CATEGORY_ERRORS);
}