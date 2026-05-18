import api from "@/lib/axios"; // Твій екземпляр axios
import { UserDto, CreateMasterDto, MasterCreatedResponseDto, UserUpdateDto } from "../types/Masters";
import { CreateWorkPostDto, WorkPostDto } from "../types/WorkPosts";

export const masterService = {
  // Отримання всіх майстрів СТО
  getAllMasters: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>("/users/masters");
    return response.data;
  },

  // Отримання картки конкретного працівника
  getMasterById: async (id: number): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/users/${id}`);
    return response.data;
  },

  // Створення майстра з поверненням згенерованого пароля
  createMaster: async (dto: CreateMasterDto): Promise<MasterCreatedResponseDto> => {
    const response = await api.post<MasterCreatedResponseDto>("/users/masters", dto);
    return response.data;
  },

  // Оновлення профілю працівника (PUT)
  updateMaster: async (dto: UserUpdateDto): Promise<void> => {
    await api.put("/users", dto);
  },

  // Швидке перемикання статусу через PATCH (строго під твій бекенд)
  toggleStatus: async (id: number): Promise<void> => {
    await api.patch(`/users/${id}/toggle-status`);
  },

  // Повне видалення облікового запису з бази
  deleteMaster: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  

  // --- РОБОЧІ ПОСТИ СТО ---
  getAllWorkPosts: async (onlyActive: boolean = false): Promise<WorkPostDto[]> => {
    const response = await api.get<WorkPostDto[]>(`/workposts?onlyActive=${onlyActive}`);
    return response.data;
  },

  getWorkPostById: async (id: number): Promise<WorkPostDto> => {
    const response = await api.get<WorkPostDto>(`/workposts/${id}`);
    return response.data;
  },

  createWorkPost: async (dto: CreateWorkPostDto): Promise<WorkPostDto> => {
    const response = await api.post<WorkPostDto>("/workposts", dto);
    return response.data;
  },

  // Синхронізовано з твоїм [HttpPut("{id}")] де id йде в URL
  updateWorkPost: async (id: number, dto: CreateWorkPostDto): Promise<void> => {
    await api.put(`/workposts/${id}`, dto);
  },

  // Синхронізовано з [HttpPatch("{id}/toggle")]
  toggleWorkPostStatus: async (id: number): Promise<void> => {
    await api.patch(`/workposts/${id}/toggle`);
  },

  deleteWorkPost: async (id: number): Promise<void> => {
    await api.delete(`/workposts/${id}`);
  }
};