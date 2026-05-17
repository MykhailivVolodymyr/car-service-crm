// Оскільки в твоєму контролері повертається CategoryDto
export interface ServiceCategoryDto {
  id: number;
  name: string;
}

export interface CreateServiceCategoryDto {
  name: string;
}

// Базовий інтерфейс послуги прайс-листа СТО
export interface GlobalServiceDto {
  id: number;
  name: string;
  defaultPrice: number;
  categoryId: number;
  categoryName: string;
}

export interface CreateGlobalServiceDto {
  name: string;
  defaultPrice: number;
  categoryId: number;
}