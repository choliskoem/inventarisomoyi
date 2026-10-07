'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getFormValues, validationFailed, type ActionState } from '@/lib/action-state';
import { MOVEMENT_TYPE_LABEL } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';
import { formatNumber } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { createItemSchema, idSchema, itemSchema, movementSchema } from '@/lib/validation';
import { createItem, deleteItem, updateItem } from '@/services/item.service';
import { recordMovement } from '@/services/stock.service';

const INVALID_ID: ActionState = { message: 'Barang tidak valid.' };

function revalidateInventory() {
  revalidatePath('/', 'layout');
}

export async function createItemAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = getFormValues(formData);
  const parsed = createItemSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error, values);

  let itemId: string;
  try {
    itemId = await createItem(await createClient(), parsed.data);
  } catch (error) {
    return { message: getErrorMessage(error), values };
  }

  revalidateInventory();
  redirect(`/items/${itemId}`);
}

export async function updateItemAction(
  itemId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!idSchema.safeParse(itemId).success) return INVALID_ID;

  const values = getFormValues(formData);
  const parsed = itemSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error, values);

  try {
    await updateItem(await createClient(), itemId, parsed.data);
  } catch (error) {
    return { message: getErrorMessage(error), values };
  }

  revalidateInventory();
  return { ok: true, message: 'Data barang disimpan.', values };
}

export async function deleteItemAction(itemId: string): Promise<ActionState> {
  if (!idSchema.safeParse(itemId).success) return INVALID_ID;

  try {
    await deleteItem(await createClient(), itemId);
  } catch (error) {
    return { message: getErrorMessage(error) };
  }

  revalidateInventory();
  redirect('/items');
}

export async function recordMovementAction(
  itemId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!idSchema.safeParse(itemId).success) return INVALID_ID;

  const values = getFormValues(formData);
  const parsed = movementSchema.safeParse(values);
  if (!parsed.success) return validationFailed(parsed.error, values);

  try {
    await recordMovement(await createClient(), itemId, parsed.data);
  } catch (error) {
    return { message: getErrorMessage(error), values };
  }

  revalidateInventory();
  const { type, quantity } = parsed.data;
  return { ok: true, message: `Stok ${MOVEMENT_TYPE_LABEL[type].toLowerCase()} ${formatNumber(quantity)} dicatat.` };
}