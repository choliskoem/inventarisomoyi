'use server';

import { revalidatePath } from 'next/cache';
import { getFormValues, validationFailed, type ActionState } from '@/lib/action-state';
import { getErrorMessage } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';
import { categorySchema, idSchema } from '@/lib/validation';
import { createCategory, deleteCategory, updateCategory } from '@/services/category.service';

const INVALID_ID: ActionState = { message: 'Kategori tidak valid.' };

function revalidateInventory() {
  revalidatePath('/', 'layout');
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = getFormValues(formData);
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error, values);

  try {
    await createCategory(await createClient(), parsed.data);
  } catch (error) {
    return { message: getErrorMessage(error), values };
  }

  revalidateInventory();
  return { ok: true, message: `Kategori "${parsed.data.name}" ditambahkan.` };
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!idSchema.safeParse(categoryId).success) return INVALID_ID;

  const values = getFormValues(formData);
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error, values);

  try {
    await updateCategory(await createClient(), categoryId, parsed.data);
  } catch (error) {
    return { message: getErrorMessage(error), values };
  }

  revalidateInventory();
  return { ok: true, message: 'Kategori diperbarui.' };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  if (!idSchema.safeParse(categoryId).success) return INVALID_ID;

  try {
    await deleteCategory(await createClient(), categoryId);
  } catch (error) {
    return { message: getErrorMessage(error) };
  }

  revalidateInventory();
  return { ok: true, message: 'Kategori dihapus.' };
}