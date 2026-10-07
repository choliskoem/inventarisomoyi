import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteItemAction, recordMovementAction, updateItemAction } from '@/actions/item.actions';
import { DeleteButton } from '@/components/delete-button';
import { ItemForm } from '@/components/items/item-form';
import { MovementForm } from '@/components/items/movement-form';
import { StockBadge } from '@/components/stock-badge';
import { Card } from '@/components/ui/card';
import { MOVEMENT_TYPE_LABEL } from '@/lib/config';
import { formatDateTime, formatNumber } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { idSchema } from '@/lib/validation';
import { listCategoryOptions } from '@/services/category.service';
import { getItem } from '@/services/item.service';
import { listMovements } from '@/services/stock.service';
import { listUnits } from '@/services/unit.service';

export const metadata: Metadata = { title: 'Detail Barang' };

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();

  const db = await createClient();
  const [item, movements, categories, units] = await Promise.all([
    getItem(db, id),
    listMovements(db, id),
    listCategoryOptions(db),
    listUnits(db),
  ]);
  if (!item) notFound();

  return (
    <>
      <div className="mb-6">
        <Link href="/items" className="text-sm text-slate-500 hover:text-emerald-700">
          ← Kembali ke daftar barang
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-slate-500">{item.sku}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{item.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kategori{' '}
              <Link href={`/items?category=${item.categoryId}`} className="font-medium text-slate-700 hover:text-emerald-700">
                {item.categoryName}
              </Link>
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-right shadow-sm">
            <p className="text-xs text-slate-500">Stok saat ini</p>
            <p className="text-3xl font-bold tabular-nums text-slate-900">
              {formatNumber(item.quantity)} <span className="text-base font-medium text-slate-500">{item.unitName}</span>
            </p>
            <StockBadge status={item.stockStatus} />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card title="Catat stok masuk / keluar">
          <MovementForm action={recordMovementAction.bind(null, item.id)} unitName={item.unitName} />
        </Card>

        <Card title="Riwayat mutasi" description="100 mutasi terakhir" className="lg:col-span-2">
          {movements.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada mutasi stok.</p>
          ) : (
            <div className="-m-5 max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Waktu</th>
                    <th className="px-5 py-2 font-medium">Jenis</th>
                    <th className="px-5 py-2 text-right font-medium">Jumlah</th>
                    <th className="px-5 py-2 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-5 py-2.5 whitespace-nowrap text-slate-600">{formatDateTime(movement.createdAt)}</td>
                      <td className="px-5 py-2.5">{MOVEMENT_TYPE_LABEL[movement.type]}</td>
                      <td
                        className={`px-5 py-2.5 text-right font-semibold tabular-nums ${
                          movement.type === 'in' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {movement.type === 'in' ? '+' : '−'}
                        {formatNumber(movement.quantity)}
                      </td>
                      <td className="px-5 py-2.5 text-slate-600">{movement.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Ubah data barang"
          className="lg:col-span-3"
          actions={
            <DeleteButton
              action={deleteItemAction.bind(null, item.id)}
              confirmMessage={`Hapus "${item.name}" beserta seluruh riwayat stoknya?`}
              label="Hapus Barang"
            />
          }
        >
          <ItemForm
            action={updateItemAction.bind(null, item.id)}
            categories={categories}
            units={units}
            item={item}
            cancelHref="/items"
          />
        </Card>
      </div>
    </>
  );
}