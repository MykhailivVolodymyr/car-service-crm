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