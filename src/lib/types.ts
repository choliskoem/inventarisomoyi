export type MovementType = 'in' | 'out';
export type StockStatus = 'ok' | 'low' | 'empty';
export type ExportFormat = 'excel' | 'pdf';

export interface Unit {
  id: number;
  code: string;
  name: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  description: string | null;
  itemCount: number;
  totalQuantity: number;
  lowStockCount: number;
}

export interface ItemOverview {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  minStock: number;
  categoryId: string;
  categoryName: string;
  unitId: number;
  unitCode: string;
  unitName: string;
  quantity: number;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  note: string | null;
  createdAt: string;
}

export interface ItemFilter {
  categoryId?: string;
  q?: string;
}