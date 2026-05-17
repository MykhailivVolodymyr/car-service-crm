import api from "@/lib/axios";
import { ServiceCategoryDto } from "../types/Services";

// Строгі інтерфейси під твої C# DTO рекорди
export interface ServiceDto {
  id: number;
  name: string;
  description: string | null;
  defaultPrice: number;
  categoryId: number;
  categoryName: string;
}

export interface CreateServiceDto {
  name: string;
  description: string | null;
  defaultPrice: number;
  categoryId: number | null;
  categoryName: string | null;
}

export interface UpdateServiceDto {
  id: number;
  name: string;
  description: string | null;
  defaultPrice: number;
  categoryId: number;
}

export const servicePriceListService = {
  // Категорії авторобіт (ендпоінт /servicecategories)
  getAllCategories: async (): Promise<ServiceCategoryDto[]> => {
    const response = await api.get<ServiceCategoryDto[]>("/servicecategories");
    return response.data;
  },

  createCategory: async (dto: { name: string }): Promise<ServiceCategoryDto> => {
    const response = await api.post<ServiceCategoryDto>("/servicecategories", dto);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/servicecategories/${id}`);
  },

  // Автороботи (ендпоінт /services)
  getGlobalServices: async (): Promise<ServiceDto[]> => {
    const response = await api.get<ServiceDto[]>("/services");
    return response.data;
  },

  getServiceById: async (id: number): Promise<ServiceDto> => {
    const response = await api.get<ServiceDto>(`/services/${id}`);
    return response.data;
  },

  searchGlobalServices: async (searchTerm: string): Promise<ServiceDto[]> => {
    const response = await api.get<ServiceDto[]>(`/services/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  createService: async (dto: CreateServiceDto): Promise<void> => {
    await api.post("/services", dto);
  },

  // Синхронізовано з твоєю сигнатурою контролера [HttpPut] (Id йде всередині DTO)
  updateService: async (dto: UpdateServiceDto): Promise<void> => {
    await api.put("/services", dto);
  },

  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  }
};