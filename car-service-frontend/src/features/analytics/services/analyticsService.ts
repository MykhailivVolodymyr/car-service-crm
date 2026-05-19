import api from "@/lib/axios"; // Твій налаштований екземпляр axios
import { 
  AnalyticsRequestDto, 
  GeneralAnalyticsDto, 
  VehiclePopularityDto, 
  ClientPopularityDto, 
  ServicePopularityDto, 
  DailyActivityDto, 
  HourlyLoadDto 
} from "../types/Analytics";

export const analyticsService = {
  getGeneral: async (params: AnalyticsRequestDto) => 
    (await api.get<GeneralAnalyticsDto>("/analytics/general", { params })).data,

  getTopVehicles: async (params: AnalyticsRequestDto) => 
    (await api.get<VehiclePopularityDto[]>("/analytics/top-vehicles", { params })).data,

  getTopClients: async (params: AnalyticsRequestDto) => 
    (await api.get<ClientPopularityDto[]>("/analytics/top-clients", { params })).data,

  getTopServices: async (params: AnalyticsRequestDto) => 
    (await api.get<ServicePopularityDto[]>("/analytics/top-services", { params })).data,

  getDailyActivity: async (params: AnalyticsRequestDto) => 
    (await api.get<DailyActivityDto[]>("/analytics/daily-activity", { params })).data,

  getHourlyLoad: async (params: AnalyticsRequestDto) => 
    (await api.get<HourlyLoadDto[]>("/analytics/hourly-load", { params })).data,
};