import api from "@/lib/axios"; 
import { ClientDto, CreateClientDto } from "../types/Client";
import { ClientOrderDto, ClientScheduleDto, VehicleDto } from "../types/ClientDetails";

// Типи для довідників брендів та моделей авто
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

// DTO для відправки на бекенд (відповідає твоему CreateVehicleDto)
export interface CreateVehicleRequestDto {
  clientId: number | null;
  clientPhone: string | null;
  clientFullName: string | null;
  clientEmail: string | null;
  modelId: number | null;
  brandName: string | null;
  modelName: string | null;
  vin: string;
  licensePlate: string;
  year: number;
}

export const clientService = {
  // Отримати всіх клієнтів
  getAllClients: async (): Promise<ClientDto[]> => {
    const response = await api.get<ClientDto[]>("/clients");
    return response.data;
  },

  // Пошук клієнтів
  searchClients: async (searchTerm: string): Promise<ClientDto[]> => {
    const response = await api.get<ClientDto[]>("/clients/search", {
      params: { searchTerm },
    });
    return response.data;
  },

  // Отримати конкретного клієнта за ID (для Хабу 360)
  getById: async (id: number): Promise<ClientDto> => {
    const response = await api.get<ClientDto>(`/clients/${id}`);
    return response.data;
  },

  // Створити клієнта (Тільки Менеджер)
  createClient: async (dto: CreateClientDto): Promise<ClientDto> => {
    const response = await api.post<ClientDto>("/clients", dto);
    return response.data;
  },

  // Оновлення клієнта через сервіс
  updateClient: async (id: number, dto: CreateClientDto): Promise<void> => {
    await api.put(`/clients/${id}`, dto);
  },

  // Видалити клієнта (Тільки Менеджер)
  deleteClient: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  // Отримати автомобілі водія
  getVehiclesByClient: async (clientId: number): Promise<VehicleDto[]> => {
    const response = await api.get<VehicleDto[]>(`/vehicles/client/${clientId}`);
    return response.data;
  },

  // Отримати записи в розклад для водія
  getSchedulesByClient: async (clientId: number): Promise<ClientScheduleDto[]> => {
    const response = await api.get<ClientScheduleDto[]>(`/schedule/client/${clientId}`);
    return response.data;
  },

  // Отримати замовлення-наряди для водія
  getOrdersByClient: async (clientId: number): Promise<ClientOrderDto[]> => {
    const response = await api.get<ClientOrderDto[]>(`/orders/client/${clientId}`);
    return response.data;
  },

  // 🚗 МЕТОДИ CRUD ДЛЯ АВТОМОБІЛІВ
  createVehicle: async (dto: CreateVehicleRequestDto): Promise<VehicleDto> => {
    const response = await api.post<VehicleDto>("/vehicles", dto);
    return response.data;
  },

  updateVehicle: async (id: number, dto: CreateVehicleRequestDto): Promise<void> => {
    await api.put(`/vehicles/${id}`, dto);
  },

  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  searchBrands: async (searchTerm: string): Promise<VehicleBrandDto[]> => {
    const response = await api.get<VehicleBrandDto[]>("/vehicleBrands/search", {
      params: { searchTerm }
    });
    return response.data;
  },

  searchModels: async (searchTerm: string): Promise<VehicleModelDto[]> => {
    const response = await api.get<VehicleModelDto[]>("/vehicleModels/search", {
      params: { searchTerm }
    });
    return response.data;
  }
};