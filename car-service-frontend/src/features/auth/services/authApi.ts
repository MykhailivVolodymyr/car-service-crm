import api from '@/lib/axios';
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto } from '@/types/auth';
import { tokenService } from '@/services/tokenService';

export const authApi = {
  login: async (data: LoginRequestDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/auth/login', data);
    
    // Одразу зберігаємо токен та дані користувача в сесію
    if (response.data && response.data.token) {
      tokenService.setAuthData(response.data.token, {
        fullName: response.data.fullName,
        role: response.data.role
      });
    }
    return response.data;
  },

  register: async (data: RegisterRequestDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  }
};