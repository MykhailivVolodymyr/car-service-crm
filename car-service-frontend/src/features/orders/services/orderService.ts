import api from "@/lib/axios";
import { OrderDto, CreateOrderDto, VehicleDto, ClientDto, VehicleBrandDto, VehicleModelDto, AddOrderServiceDto, OrderServiceDto, OrderPartDto, AddOrderPartDto, PartDto, ServiceDto } from "../types/Order";

export const orderService = {
  // 1. Отримання всіх замовлень СТО
  getAllOrders: async (): Promise<OrderDto[]> => {
    const response = await api.get<OrderDto[]>("/orders");
    return response.data;
  },

  // 2. Отримання замовлення за конкретним ID
  getOrderById: async (id: number): Promise<OrderDto> => {
    const response = await api.get<OrderDto>(`/orders/${id}`);
    return response.data;
  },

  // 3. Створення нового замовлення з нуля чи з прив'язкою
  createOrder: async (dto: CreateOrderDto): Promise<OrderDto> => {
    const response = await api.post<OrderDto>("/orders", dto);
    return response.data;
  },

  // 4. Повне оновлення замовлення (PUT)
  updateOrder: async (id: number, dto: CreateOrderDto): Promise<void> => {
    await api.put(`/orders/${id}`, dto);
  },

  // 5. Швидке оновлення статусу замовлення (PATCH)
  updateOrderStatus: async (id: number, statusId: number): Promise<void> => {
    await api.patch(`/orders/${id}/status/${statusId}`);
  },

  // 6. Видалення замовлення-наряду (Тільки для Менеджера)
  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // 7. Завантаження або друк замовлення-наряду (повертає PDF Blob)
  printOrderInvoice: async (id: number): Promise<Blob> => {
    const response = await api.get(`/orders/${id}/print`, {
      responseType: "blob", // Суворо вказуємо blob для бінарного файлу PDF
    });
    return response.data;
  },

  // 1. Пошук авто — повертає строго масив VehicleDto
  searchVehicles: async (searchTerm: string): Promise<VehicleDto[]> => {
    const response = await api.get<VehicleDto[]>(`/vehicles/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // 2. Пошук клієнтів — повертає строго масив ClientDto
  searchClients: async (searchTerm: string): Promise<ClientDto[]> => {
    const response = await api.get<ClientDto[]>(`/clients/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // 3. Пошук брендів авто (строго VehicleBrandDto[])
  searchBrands: async (searchTerm: string): Promise<VehicleBrandDto[]> => {
    const response = await api.get<VehicleBrandDto[]>(`/vehiclebrands/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // 4. Пошук моделей авто (строго VehicleModelDto[])
  searchModels: async (searchTerm: string): Promise<VehicleModelDto[]> => {
    const response = await api.get<VehicleModelDto[]>(`/vehiclemodels/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Блок послуг (OrderServices) і запчастин (OrderParts) для замовлення-наряду

  // Отримати всі роботи по ID замовлення
  getServicesByOrderId: async (orderId: number): Promise<OrderServiceDto[]> => {
    const response = await api.get<OrderServiceDto[]>(`/OrderServices/order/${orderId}`);
    return response.data;
  },

  // Додати нову роботу в наряд
  addServiceToOrder: async (dto: AddOrderServiceDto): Promise<OrderServiceDto> => {
    const response = await api.post<OrderServiceDto>('/OrderServices', dto);
    return response.data;
  },

  // Встановити точну кількість (нормо-години)
  setServiceQuantity: async (id: number, quantity: number): Promise<void> => {
    await api.patch(`/OrderServices/${id}/quantity?quantity=${quantity}`);
  },

  // Зменшити кількість на певну величину (за замовчуванням 1)
  removeServiceQuantity: async (id: number, amount: number = 1): Promise<void> => {
    await api.delete(`/OrderServices/${id}/remove-quantity?amount=${amount}`);
  },

  // Повністю видалити рядок послуги з наряду
  deleteServiceLine: async (id: number): Promise<void> => {
    await api.delete(`/OrderServices/${id}`);
  },

  // ==========================================
  //  БЛОК АВТОЗАПЧАСТИН (OrderParts)
  // ==========================================

  // Отримати всі запчастини по ID замовлення
  getPartsByOrderId: async (orderId: number): Promise<OrderPartDto[]> => {
    const response = await api.get<OrderPartDto[]>(`/OrderParts/order/${orderId}`);
    return response.data;
  },

  // Додати запчастину до наряду
  addPartToOrder: async (dto: AddOrderPartDto): Promise<OrderPartDto> => {
    const response = await api.post<OrderPartDto>('/OrderParts', dto);
    return response.data;
  },

  // Зменшити кількість запчастин на СТО
  removePartQuantity: async (id: number, amount: number = 1): Promise<void> => {
    await api.delete(`/OrderParts/${id}/remove-quantity?amount=${amount}`);
  },

  // Повністю видалити лінію запчастини з картки ремонту
  deletePartLine: async (id: number): Promise<void> => {
    await api.delete(`/OrderParts/${id}`);
  },

  // Пошук послуг у глобальному прайс-листі СТО
  searchGlobalServices: async (searchTerm: string): Promise<ServiceDto[]> => {
    const response = await api.get<ServiceDto[]>(`/services/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Пошук запчастин на складі за назвою або SKU артикулом
  searchGlobalParts: async (searchTerm: string): Promise<PartDto[]> => {
    const response = await api.get<PartDto[]>(`/parts/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  }
};