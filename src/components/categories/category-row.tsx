'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { deleteCategoryAction, updateCategoryAction } from '@/actions/category.actions';
import { DeleteButton } from '@/components/delete-button';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/form-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { initialActionState, type ActionState } from '@/lib/action-state';
import { formatNumber } from '@/lib/format';
import type { CategorySummary } from '@/lib/types';

export function CategoryRow({ category }: { category: CategorySummary }) {
  const [isEditing, setIsEditing] = useState(false);

  const [state, formAction] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateCategoryAction(category.categoryId, prev, formData);
    if (result.ok) setIsEditing(false);
    return result;
  }, initialActionState);

  if (isEditing) {
    return (
      <tr className="bg-slate-50">
        <td colSpan={4} className="px-4 py-3">
          <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input
              name="name"
              aria-label="Nama kategori"
              defaultValue={state.values?.name ?? category.categoryName}
              maxLength={100}
              className={inputClass}
            />
            <input
              name="description"
              aria-label="Keterangan"
              defaultValue={state.values?.description ?? category.description ?? ''}
              maxLength={500}
              placeholder="Keterangan"
              className={inputClass}
            />
            <div className="flex gap-2">
              <SubmitButton size="sm">Simpan</SubmitButton>
              <button type="button" onClick={() => setIsEditing(false)} className={buttonClass('ghost', 'sm')}>
                Batal
              </button>
            </div>
            {state.message && !state.ok && (
              <p role="alert" className="text-xs text-red-600 sm:col-span-3">
                {state.fieldErrors?.name?.[0] ?? state.message}
              </p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-4 py-3">
        <Link href={`/items?category=${category.categoryId}`} className="font-medium text-slate-900 hover:text-emerald-700">
          {category.categoryName}
        </Link>
        {category.description && <p className="text-xs text-slate-500">{category.description}</p>}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(category.itemCount)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(category.totalQuantity)}</td>
      <td className="px-4 py-3">
        <div className="flex items-start justify-end gap-2">
          <button type="button" onClick={() => setIsEditing(true)} className={buttonClass('secondary', 'sm')}>
            Ubah
          </button>
          <DeleteButton
            action={deleteCategoryAction.bind(null, category.categoryId)}
            confirmMessage={`Hapus kategori "${category.categoryName}"?`}
          />
        </div>
      </td>
    </tr>
  );
}