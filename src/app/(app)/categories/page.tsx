import type { Metadata } from 'next';
import { CategoryCreateForm } from '@/components/categories/category-create-form';
import { CategoryRow } from '@/components/categories/category-row';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { createClient } from '@/lib/supabase/server';
import { listCategorySummaries } from '@/services/category.service';

export const metadata: Metadata = { title: 'Kategori' };

export default async function CategoriesPage() {
  const categories = await listCategorySummaries(await createClient());

  return (
    <>
      <PageHeader title="Kategori" description="Kelompokkan barang agar mudah dihitung dan dilaporkan." />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card title="Tambah kategori">
          <CategoryCreateForm />
        </Card>

        <Card title={`Daftar kategori (${categories.length})`} className="lg:col-span-2">
          {categories.length === 0 ? (
            <EmptyState title="Belum ada kategori" description="Tambahkan kategori pertama Anda di form samping." />
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Nama</th>
                    <th className="px-4 py-2 text-right font-medium">Jenis barang</th>
                    <th className="px-4 py-2 text-right font-medium">Total jumlah</th>
                    <th className="px-4 py-2">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <CategoryRow key={category.categoryId} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}