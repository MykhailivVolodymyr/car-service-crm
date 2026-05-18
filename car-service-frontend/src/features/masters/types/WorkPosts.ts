export interface WorkPostDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CreateWorkPostDto {
  name: string;
  isActive: boolean;
}