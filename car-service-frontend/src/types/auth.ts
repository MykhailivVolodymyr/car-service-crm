export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  fullName: string;
  role: string;
}