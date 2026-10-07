import type { Metadata } from 'next';
import Link from 'next/link';
import { createItemAction } from '@/actions/item.actions';
import { ItemForm } from '@/components/items/item-form';
import { buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { createClient } from '@/lib/supabase/server';
import { parseItemFilter } from '@/lib/validation';
import { listCategoryOptions } from '@/services/category.service';
import { listUnits } from '@/services/unit.service';

export const metadata: Metadata = { title: 'Tambah Barang' };

interface NewItemPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NewItemPage({ searchParams }: NewItemPageProps) {
  const { categoryId } = parseItemFilter(await searchParams);
  const db = await createClient();
  const [categories, units] = await Promise.all([listCategoryOptions(db), listUnits(db)]);

  return (
    <>
      <PageHeader title="Tambah Barang" description="Isi data barang dan stok awalnya." />

      {categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori"
          description="Setiap barang harus masuk ke satu kategori."
          action={<Link href="/categories" className={buttonClass()}>Buat kategori</Link>}
        />
      ) : (
        <Card className="max-w-3xl">
          <ItemForm
            action={createItemAction}
            categories={categories}
            units={units}
            defaultCategoryId={categoryId}
            cancelHref="/items"
          />
        </Card>
      )}
    </>
  );
}