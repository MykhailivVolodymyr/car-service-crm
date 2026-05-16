export interface ScheduleDto {
  id: number;
  orderId: number | null;
  vehicleDisplay: string | null;
  clientId: number | null;
  clientName: string | null;
  clientPhone: string | null;
  postId: number;
  postName: string;
  mechanicId: number;
  mechanicName: string;
  startTime: string;
  endTime: string;
  description: string | null;
}

export interface ScheduleFilterDto {
  date?: string;
  postId?: number;
  mechanicId?: number;
  searchTerm?: string;
}

export interface MasterUserDto {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  roleName: string;
  isActive: boolean;
}

export interface WorkPostDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface OrderSearchResultDto {
  id: number;
  vehicleDisplay: string;
  clientName: string;
  clientPhone: string;
}