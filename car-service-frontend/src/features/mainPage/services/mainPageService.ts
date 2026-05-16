import api from "@/lib/axios";
import { DashboardStats } from "@/features/mainPage/types/DashboardStats";
import { MasterUserDto, ScheduleDto, WorkPostDto, ScheduleFilterDto, OrderSearchResultDto } from "../types/Schedule";
import { appendFile } from "fs";

export const mainPageService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/analytics/dashboard-stats");
    return response.data;
  },

  // Новий метод для отримання розкладу з фільтрами
  getFilteredSchedules: async (filters: ScheduleFilterDto): Promise<ScheduleDto[]> => {
    const response = await api.get<ScheduleDto[]>("/schedule/filter", {
      params: filters,
    });
    return response.data;
  },

  // Отримання реальних майстрів з UsersController
  getAllMasters: async (): Promise<MasterUserDto[]> => {
    const response = await api.get<MasterUserDto[]>("/users/masters");
    return response.data;
  },

  // Отримання реальних робочих постів (боксів) з WorkPostsController
  getAllWorkPosts: async (onlyActive: boolean = true): Promise<WorkPostDto[]> => {
    const response = await api.get<WorkPostDto[]>("/workposts", {
      params: { onlyActive },
    });
    return response.data;
  },

  // 1. Пошук активних замовлень (автокомпліт)
  searchActiveOrders: async (term: string): Promise<OrderSearchResultDto[]> => {
    if (!term.trim()) return [];
    const response = await api.get<OrderSearchResultDto[]>("/orders/search", {
      params: { term }
    });
    return response.data;
  },

  // 2. Створення самого замовлення (якщо обрано режим створення нового)
  createOrder: async (orderData: any): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>("/orders", orderData);
    return response.data;
  },

  // 3. Створення фінального запису в розкладі
  createSchedule: async (scheduleData: any): Promise<ScheduleDto> => {
    const response = await api.post<ScheduleDto>("/schedule", scheduleData);
    return response.data;
  },

  getScheduleById: async (id: number): Promise<ScheduleDto> => {
    const response = await api.get<ScheduleDto>(`/schedule/${id}`);
    return response.data;
  },

  updateSchedule: async (id: number, scheduleData: any): Promise<void> => {
    await api.put(`/schedule/${id}`, scheduleData);
  },

  updateOrder: async (id: number, orderData: any): Promise<void> => {
    await api.put(`/orders/${id}`, orderData);
  },

  // Видалення запису розкладу за ID
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/schedule/${id}`);
  },

  // Отримання записів за вказаний період дати від-до
  getSchedulesByPeriod: async (start: string, end: string): Promise<ScheduleDto[]> => {
    const response = await api.get<ScheduleDto[]>("/schedule/period", {
      params: { start, end }
    });
    return response.data;
}
};