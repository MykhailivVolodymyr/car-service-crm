export interface AnalyticsRequestDto {
  startDate?: string | null;
  endDate?: string | null;
  periodType?: "week" | "month" | "quarter" | "custom";
}

export interface GeneralAnalyticsDto {
  totalAppointments: number;
  completedOrders: number;
  totalRevenue: number;
  averageCheck: number;
  avgAppointmentsPerDay: number;
  conversionRate: number;
}

export interface VehiclePopularityDto {
  brand: string;
  model: string;
  visitCount: number;
}

export interface ClientPopularityDto {
  fullName: string;
  phone: string;
  visitCount: number;
}

export interface ServicePopularityDto {
  serviceName: string;
  usageCount: number;
  totalRevenue: number;
}

export interface DailyActivityDto {
  dayName: string;
  appointments: number;
  revenue: number;
}

export interface HourlyLoadDto {
  hour: string; // Формат "08:00"
  appointmentsCount: number;
}