'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { buttonClass } from '@/components/ui/button';
import { FormField, inputClass } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { SubmitButton } from '@/components/ui/submit-button';
import { initialActionState, type FormAction } from '@/lib/action-state';
import type { CategoryOption, ItemOverview, Unit } from '@/lib/types';

interface ItemFormProps {
  action: FormAction;
  categories: CategoryOption[];
  units: Unit[];
  /** Diisi saat mengubah barang; kosong saat membuat barang baru. */
  item?: ItemOverview;
  defaultCategoryId?: string;
  cancelHref: string;
}

export function ItemForm({ action, categories, units, item, defaultCategoryId, cancelHref }: ItemFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const isCreate = !item;
  const errors = state.fieldErrors ?? {};

  /** Nilai yang dikirim terakhir (jika ada) > data barang > nilai bawaan. */
  const value = (field: string, fallback: string | number | null | undefined = '') =>
    state.values?.[field] ?? String(fallback ?? '');

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Kode barang (SKU)" htmlFor="sku" error={errors.sku} required>
        <input id="sku" name="sku" maxLength={50} placeholder="mis. ELK-001" defaultValue={value('sku', item?.sku)} aria-invalid={Boolean(errors.sku)} className={inputClass} />
      </FormField>

      <FormField label="Nama barang" htmlFor="name" error={errors.name} required>
        <input id="name" name="name" maxLength={150} defaultValue={value('name', item?.name)} aria-invalid={Boolean(errors.name)} className={inputClass} />
      </FormField>

      <FormField label="Kategori" htmlFor="category_id" error={errors.category_id} required>
        <select
          id="category_id"
          name="category_id"
          defaultValue={value('category_id', item?.categoryId ?? defaultCategoryId)}
          aria-invalid={Boolean(errors.category_id)}
          className={inputClass}
        >
          <option value="">— Pilih kategori —</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Satuan" htmlFor="unit_id" error={errors.unit_id} required>
        <select id="unit_id" name="unit_id" defaultValue={value('unit_id', item?.unitId ?? units[0]?.id)} aria-invalid={Boolean(errors.unit_id)} className={inputClass}>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </FormField>

      {isCreate && (
        <FormField label="Stok awal" htmlFor="initial_quantity" error={errors.initial_quantity} hint="Dicatat sebagai mutasi masuk “Stok awal”.">
          <input id="initial_quantity" name="initial_quantity" inputMode="decimal" defaultValue={value('initial_quantity', 0)} aria-invalid={Boolean(errors.initial_quantity)} className={inputClass} />
        </FormField>
      )}

      <FormField label="Stok minimum" htmlFor="min_stock" error={errors.min_stock} hint="Status “Menipis” jika jumlah ≤ angka ini.">
        <input id="min_stock" name="min_stock" inputMode="decimal" defaultValue={value('min_stock', item?.minStock ?? 0)} aria-invalid={Boolean(errors.min_stock)} className={inputClass} />
      </FormField>

      <FormField label="Keterangan" htmlFor="description" error={errors.description} className="sm:col-span-2">
        <textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={value('description', item?.description)} className={inputClass} />
      </FormField>

      <div className="space-y-4 sm:col-span-2">
        <FormMessage state={state} />
        <div className="flex gap-2">
          <SubmitButton>{isCreate ? 'Simpan Barang' : 'Simpan Perubahan'}</SubmitButton>
          <Link href={cancelHref} className={buttonClass('secondary')}>
            Batal
          </Link>
        </div>
      </div>
    </form>
  );
}