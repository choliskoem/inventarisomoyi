import type { Metadata } from 'next';
import Link from 'next/link';
import { ExportButtons } from '@/components/export-buttons';
import { StockBadge } from '@/components/stock-badge';
import { buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { formatNumber } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { listCategorySummaries } from '@/services/category.service';
import { listLowStockItems } from '@/services/item.service';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const db = await createClient();
  const [categories, lowStockItems] = await Promise.all([listCategorySummaries(db), listLowStockItems(db)]);

  const totals = categories.reduce(
    (acc, category) => ({
      items: acc.items + category.itemCount,
      quantity: acc.quantity + category.totalQuantity,
      lowStock: acc.lowStock + category.lowStockCount,
    }),
    { items: 0, quantity: 0, lowStock: 0 },
  );

  const stats = [
    { label: 'Kategori', value: categories.length },
    { label: 'Jenis barang', value: totals.items },
    { label: 'Total jumlah stok', value: totals.quantity },
    { label: 'Stok menipis / habis', value: totals.lowStock, warn: totals.lowStock > 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan stok barang per kategori." actions={<ExportButtons />} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${stat.warn ? 'text-amber-600' : 'text-slate-900'}`}>
              {formatNumber(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Jumlah per kategori" className="lg:col-span-3">
          {categories.length === 0 ? (
            <EmptyState
              title="Belum ada kategori"
              description="Mulai dengan membuat kategori, lalu tambahkan barang."
              action={<Link href="/categories" className={buttonClass()}>Buat kategori</Link>}
            />
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Kategori</th>
                    <th className="px-5 py-2 text-right font-medium">Jenis</th>
                    <th className="px-5 py-2 text-right font-medium">Total jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.categoryId}>
                      <td className="px-5 py-3">
                        <Link href={`/items?category=${category.categoryId}`} className="font-medium hover:text-emerald-700">
                          {category.categoryName}
                        </Link>
                        {category.lowStockCount > 0 && (
                          <span className="ml-2 text-xs text-amber-600">{category.lowStockCount} menipis</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatNumber(category.itemCount)}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatNumber(category.totalQuantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Perlu diisi ulang" description="Barang dengan stok menipis atau habis" className="lg:col-span-2">
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-500">Semua stok aman.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStockItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/items/${item.id}`} className="block truncate text-sm font-medium hover:text-emerald-700">
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatNumber(item.quantity)} {item.unitName} · min. {formatNumber(item.minStock)}
                    </p>
                  </div>
                  <StockBadge status={item.stockStatus} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}