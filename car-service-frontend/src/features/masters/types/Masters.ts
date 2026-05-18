export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  roleName: string;
  isActive: boolean;
}

export interface CreateMasterDto {
  fullName: string;
  email: string;
  phone: string | null;
}

export interface MasterCreatedResponseDto {
  email: string;
  password: string;
}

export interface UserUpdateDto {
  id: number;
  fullName: string;
  phone: string | null;
  roleId: number;
  isActive: boolean;
}


export interface MasterPerformanceDto {
  masterId: number;
  masterName: string;
  ordersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalWorkHours: number;
}

export interface AnalyticsRequestDto {
  startDate?: string | null;
  endDate?: string | null;
  periodType?: "week" | "month" | "quarter" | "custom" | string | null;
}