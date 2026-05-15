"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../services/authApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react"; // Імпортуємо іконки для пароля

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Стан для показу пароля
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.login({ email, password });
      router.push("/"); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Невірний email або пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-0 rounded-2xl overflow-hidden font-sans">
      <CardHeader className="text-center pb-8 pt-10">
        <CardTitle className="text-2xl font-semibold tracking-tight text-slate-800">
          Вхід у систему
        </CardTitle>
        <CardDescription className="text-slate-500 mt-1">
          Введіть email та пароль для доступу до CRM
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-600 font-medium">Email адреса</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@sto.com"
              
              className="h-11 text-base rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            {/* Огортаємо в relative, щоб позиціонувати кнопку ока всередині інпута */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Динамічно змінюємо тип
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 text-base rounded-xl bg-slate-50 border-slate-200 pr-10 focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base shadow-md transition-colors cursor-pointer" 
            disabled={loading}
          >
            {loading ? "Виконується вхід..." : "Увійти"}
          </Button>

          <div className="text-center text-sm text-slate-500 pt-6 mt-6 border-t border-slate-100">
            Немає аккаунту?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 cursor-pointer" 
              onClick={() => router.push("/register")} 
              type="button"
            >
              Зареєструватись
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}