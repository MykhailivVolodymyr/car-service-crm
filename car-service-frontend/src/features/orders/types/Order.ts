export interface OrderDto {
  id: number;
  vehicleId: number;
  vehicleDetails: string; // Марка + Модель + Номер
  clientId: number;
  clientName: string;
  clientPhone: string;
  statusId: number;
  statusName: string;
  createdAt: string; // ISO string
  closedAt: string | null;
  mileage: number | null;
  totalAmount: number;
  notes: string | null;
}

export interface CreateOrderDto {
  vehicleId: number | null;
  statusId: number;

  // Дані для створення авто з нуля (якщо vehicleId == null)
  modelId: number | null;
  brandName: string | null;
  modelName: string | null;
  vin: string | null;
  licensePlate: string | null;
  year: number | null;

  // Дані для клієнта
  clientId: number | null;
  clientPhone: string | null;
  clientFullName: string | null;
  clientEmail: string | null;

  // Дані замовлення
  mileage: number | null;
  notes: string | null;
}

// Допоміжний інтерфейс для карток статистики статусів на СТО
export interface OrderStats {
  newCount: number;         // StatusId = 1
  inProgressCount: number;   // StatusId = 2
  waitingPartsCount: number; // StatusId = 3
  readyCount: number;        // StatusId = 4
  totalCount: number;
}

// Додаємо строгі інтерфейси відповідно до твоїх C# рекордів
export interface ClientDto {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface VehicleDto {
  id: number;
  clientId: number | null;
  clientFullName: string | null;
  clientPhone: string | null;
  modelId: number;
  brandName: string;
  modelName: string;
  vin: string;
  licensePlate: string;
  year: number;
}

export interface VehicleBrandDto {
  id: number;
  name: string;
}

export interface VehicleModelDto {
  id: number;
  brandId: number;
  brandName: string;
  name: string;
}

// Додаємо в кінець файлу src/features/orders/types/Order.ts

export interface OrderServiceDto {
  id: number;
  orderId: number;
  serviceId: number | null;
  serviceName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface AddOrderServiceDto {
  orderId: number;
  serviceId: number | null;
  customName: string | null;
  price: number | null;
  quantity: number;
}

export interface OrderPartDto {
  id: number;
  orderId: number;
  partId: number | null;
  partName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface AddOrderPartDto {
  orderId: number;
  partId: number | null;
  partName: string | null;
  price: number | null;
  quantity: number;
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string | null;
  defaultPrice: number; // Змінено з price -> defaultPrice
  categoryId: number;
  categoryName: string;
}

export interface PartDto {
  id: number;
  name: string;
  sku: string | null;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number; // Змінено з price -> sellingPrice
  categoryId: number;
  categoryName: string;
  manufacturerId: number;
  manufacturerName: string;
}