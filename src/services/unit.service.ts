import { toAppError } from '@/lib/errors';
import type { DbClient } from '@/lib/supabase/server';
import type { Unit } from '@/lib/types';

export async function listUnits(db: DbClient): Promise<Unit[]> {
  const { data, error } = await db.from('units').select('id, code, name').order('id');
  if (error) throw toAppError(error);
  return data;
}