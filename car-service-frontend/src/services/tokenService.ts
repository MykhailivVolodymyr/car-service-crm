const TOKEN_KEY = "car_service_token";
const USER_KEY = "car_service_user";

export const tokenService = {
  setAuthData: (token: string, user: { fullName: string; role: string }) => {
    if (typeof window !== "undefined") {
      // 1. Записуємо в localStorage (щоб дані не зникали при закритті вкладки)
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      
      const maxAge = 6 * 60 * 60; // 6 годин у секундах (21600)
      document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getUser: (): { fullName: string; role: string } | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  clearAuthData: () => {
    if (typeof window !== "undefined") {
      // 1. Вичищаємо localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // 2. Затираємо куку (виставляємо дату в минулому, щоб браузер її видалив)
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};