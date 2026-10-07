import type { ItemOverview } from '@/lib/types';

export interface CategoryGroup {
  categoryName: string;
  items: ItemOverview[];
  totalQuantity: number;
}

export interface InventoryReport {
  title: string;
  filterLabel: string;
  generatedAt: Date;
  groups: CategoryGroup[];
  itemCount: number;
  grandTotal: number;
}

/** Kelompokkan barang per kategori dan hitung subtotal & total keseluruhan. */
export function buildInventoryReport(
  items: ItemOverview[],
  filterLabel: string,
  generatedAt = new Date(),
): InventoryReport {
  const groupsByName = new Map<string, CategoryGroup>();

  for (const item of items) {
    const group = groupsByName.get(item.categoryName) ?? {
      categoryName: item.categoryName,
      items: [],
      totalQuantity: 0,
    };
    group.items.push(item);
    group.totalQuantity += item.quantity;
    groupsByName.set(item.categoryName, group);
  }

  const groups = [...groupsByName.values()];

  return {
    title: 'Laporan Inventaris Barang',
    filterLabel,
    generatedAt,
    groups,
    itemCount: items.length,
    grandTotal: groups.reduce((sum, group) => sum + group.totalQuantity, 0),
  };
}