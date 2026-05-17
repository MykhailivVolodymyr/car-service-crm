export interface PartDto {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  categoryId: number;
  categoryName: string;
  manufacturerId: number;
  manufacturerName: string;
}

export interface CreatePartDto {
  name: string;
  sku: string | null;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  categoryId: number | null;
  categoryName: string | null;
  manufacturerId: number | null;
  manufacturerName: string | null;
}

export interface PartCategoryDto {
  id: number;
  name: string;
}

export interface CreatePartCategoryDto {
  name: string;
}

export interface InventoryStatsDto {
  totalPositions: number;
  totalInventoryValue: number;
  lowStockCount: number;
}