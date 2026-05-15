import axios from 'axios';
import { tokenService } from '@/services/tokenService';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7042/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor (додавання токена)
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor (ОБРОБКА ПОМИЛОК 401, 403, 500)
api.interceptors.response.use(
  (response) => response, // Якщо все добре, просто повертаємо відповідь
  (error) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Токен невалідний або згорів — чистимо sessionStorage і викидаємо на логін
          console.warn("Сесія застаріла. Перенаправлення на вхід.");
          tokenService.clearAuthData();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Немає прав (наприклад, механік лізе в налаштування каси менеджера)
          console.error("Доступ заборонено (403 Forbidden)");
          alert("У вас немає прав для виконання цієї дії!");
          break;

        case 500:
          // Помилка на бекенді .NET
          console.error("Внутрішня помилка сервера (500 Internal Server Error)");
          break;

        default:
          console.error(`Помилка API: ${status}`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;