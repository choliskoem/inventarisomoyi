import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { inputClass } from '@/components/ui/form-field';
import type { CategoryOption, ItemFilter } from '@/lib/types';

/** Form GET biasa: filter tersimpan di URL sehingga bisa dibagikan & dipakai untuk export. */
export function ItemFilterForm({ categories, filter }: { categories: CategoryOption[]; filter: ItemFilter }) {
  const hasFilter = Boolean(filter.categoryId || filter.q);

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label htmlFor="q" className="mb-1 block text-xs font-medium text-slate-600">
          Cari nama / kode
        </label>
        <input id="q" name="q" type="search" defaultValue={filter.q} placeholder="Ketik kata kunci…" className={inputClass} />
      </div>
      <div className="min-w-48">
        <label htmlFor="category" className="mb-1 block text-xs font-medium text-slate-600">
          Kategori
        </label>
        <select id="category" name="category" defaultValue={filter.categoryId ?? ''} className={inputClass}>
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonClass('primary')}>
        Terapkan
      </button>
      {hasFilter && (
        <Link href="/items" className={buttonClass('ghost')}>
          Reset
        </Link>
      )}
    </form>
  );
}