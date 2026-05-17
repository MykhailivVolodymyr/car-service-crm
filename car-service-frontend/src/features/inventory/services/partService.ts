import api from "@/lib/axios";
import { PartDto, CreatePartDto, PartCategoryDto, CreatePartCategoryDto, InventoryStatsDto } from "../types/Parts";

export const partService = {
  getAllParts: async (): Promise<PartDto[]> => {
    const response = await api.get<PartDto[]>("/parts");
    return response.data;
  },

  getPartById: async (id: number): Promise<PartDto> => {
    const response = await api.get<PartDto>(`/parts/${id}`);
    return response.data;
  },

  searchParts: async (searchTerm: string): Promise<PartDto[]> => {
    const response = await api.get<PartDto[]>(`/parts/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  getLowStockParts: async (threshold = 5): Promise<PartDto[]> => {
    const response = await api.get<PartDto[]>(`/parts/low-stock?threshold=${threshold}`);
    return response.data;
  },

  adjustQuantity: async (id: number, amount: number): Promise<void> => {
    await api.patch(`/parts/${id}/adjust-quantity?amount=${amount}`);
  },

  createPart: async (dto: CreatePartDto): Promise<void> => {
    await api.post("/parts", dto);
  },

  updatePart: async (id: number, dto: CreatePartDto): Promise<void> => {
    await api.put(`/parts/${id}`, dto);
  },

  deletePart: async (id: number): Promise<void> => {
    await api.delete(`/parts/${id}`);
  },

  // Робота з категоріями запчастин
  getAllCategories: async (): Promise<PartCategoryDto[]> => {
    const response = await api.get<PartCategoryDto[]>("/partcategories");
    return response.data;
  },

  createCategory: async (dto: CreatePartCategoryDto): Promise<PartCategoryDto> => {
    const response = await api.post<PartCategoryDto>("/partcategories", dto);
    return response.data;
  },

    getAllManufacturers: async (): Promise<{ id: number; name: string }[]> => {
        const response = await api.get<{ id: number; name: string }[]>("/manufacturers");
        return response.data;
    },

    createManufacturer: async (dto: { name: string }): Promise<{ id: number; name: string }> => {
        const response = await api.post<{ id: number; name: string }>("/manufacturers", dto);
        return response.data;
    },

    getInventoryStats: async (): Promise<InventoryStatsDto> => {
        const response = await api.get<InventoryStatsDto>("/analytics/inventory-stats");
        return response.data;
    },
};