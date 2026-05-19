export interface VehicleDto {
  id: number;
  clientId: number | null;
  clientFullName: string | null;
  clientPhone: string | null;
  modelId: number;
  brandName: string;
  modelName: string;
  vin: string;
  licensePlate: string;
  year: number;
}

export interface ClientScheduleDto {
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

export interface ClientOrderDto {
  id: number;
  vehicleId: number;
  vehicleDetails: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  statusId: number;
  statusName: string;
  createdAt: string;
  closedAt: string | null;
  mileage: number | null;
  totalAmount: number;
  notes: string | null;
}