import type { Metadata } from 'next';
import Link from 'next/link';
import { ExportButtons } from '@/components/export-buttons';
import { ItemFilterForm } from '@/components/items/item-filter';
import { StockBadge } from '@/components/stock-badge';
import { buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { formatNumber } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { parseItemFilter } from '@/lib/validation';
import { listCategoryOptions } from '@/services/category.service';
import { listItems } from '@/services/item.service';

export const metadata: Metadata = { title: 'Barang' };

interface ItemsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const filter = parseItemFilter(await searchParams);
  const db = await createClient();
  const [items, categories] = await Promise.all([listItems(db, filter), listCategoryOptions(db)]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const newItemHref = filter.categoryId ? `/items/new?category=${filter.categoryId}` : '/items/new';

  return (
    <>
      <PageHeader
        title="Barang"
        description="Daftar barang beserta jumlah stok terkini."
        actions={
          <>
            <ExportButtons filter={filter} />
            <Link href={newItemHref} className={buttonClass()}>
              + Tambah Barang
            </Link>
          </>
        }
      />

      <Card className="mb-6">
        <ItemFilterForm categories={categories} filter={filter} />
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title={filter.categoryId || filter.q ? 'Tidak ada barang yang cocok' : 'Belum ada barang'}
          description={categories.length === 0 ? 'Buat kategori terlebih dahulu sebelum menambah barang.' : undefined}
          action={
            <Link href={categories.length === 0 ? '/categories' : newItemHref} className={buttonClass()}>
              {categories.length === 0 ? 'Buat kategori' : 'Tambah barang'}
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Nama barang</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="px-4 py-3">
                    <Link href={`/items/${item.id}`} className="font-medium text-slate-900 hover:text-emerald-700">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.categoryName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-semibold">{formatNumber(item.quantity)}</span>{' '}
                    <span className="text-slate-500">{item.unitName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge status={item.stockStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3">
                  Total ({formatNumber(items.length)} jenis barang)
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(totalQuantity)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}