"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { tokenService } from "@/services/tokenService";
import { Clock, Calendar as CalendarIcon, LogOut, User, Settings, Menu } from "lucide-react";
import { format } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarContent from "./SidebarContent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 1. Фікс блимання: стейт завантаження клієнта

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const savedUser = tokenService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoaded(true); // 2. Кажемо, що клієнт готовий і дані зчитано

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isAuthPage) return null;

  const handleLogout = () => {
    tokenService.clearAuthData();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "UA";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <header className="h-16 w-full border-b bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Мобільний бургер (для малих екранів) */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-600 cursor-pointer">
              <Menu size={22} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 !w-[230px] !max-w-[230px] border-r-0">
            <SidebarContent onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Права частина: час, дата та дропдаун профілю */}
      <div className="flex items-center gap-4 md:gap-8 ml-auto">
        
        {/* Адаптивний блок часу та дати */}
        <div className="flex items-center gap-3 md:gap-6 text-slate-600">
          {/* Годинник */}
          <div className="flex items-center gap-2 font-medium">
            <Clock size={18} className="text-blue-500 shrink-0" />
            <span className="text-xs md:text-sm tabular-nums">
              {format(currentTime, "HH:mm:ss")}
            </span>
          </div>

          {/* Дата */}
          <div className="hidden md:flex items-center gap-2 font-medium border-l pl-6">
            <CalendarIcon size={18} className="text-blue-500 shrink-0" />
            <span className="text-sm">
              {format(currentTime, "dd.MM.yyyy")}
            </span>
          </div>
        </div>

        {/* Профіль користувача */}
        <div className="border-l pl-4 md:pl-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 outline-none cursor-pointer group select-none">
              {/* 3. Показуємо інфо лише після завантаження клієнта (запобігає рендеру дефолту на сервері) */}
              <div className="hidden md:flex flex-col items-end transition group-hover:opacity-80 min-h-[32px] justify-center">
                {isLoaded && (
                  <>
                    <span className="text-sm font-bold text-slate-900 leading-none">
                      {user?.fullName || "Користувач"}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                      {user?.role === "Менеджер" ? "Менеджер" : "Майстер"}
                    </span>
                  </>
                )}
              </div>
              
              <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-slate-100 group-hover:ring-blue-100 transition shadow-sm">
                <AvatarFallback className="bg-slate-100 text-blue-600 font-semibold text-xs md:text-sm">
                  {isLoaded ? getInitials(user?.fullName) : ""}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-1 font-sans">
              <DropdownMenuLabel className="md:hidden flex flex-col">
                {isLoaded && (
                  <>
                    <span className="text-sm font-bold text-slate-900">
                      {user?.fullName || "Користувач"}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      {user?.role === "Менеджер" ? "Менеджер" : "Майстер"}
                    </span>
                  </>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />

              <DropdownMenuLabel className="text-xs text-slate-400 font-medium">
                Мій акаунт
              </DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer text-slate-700 gap-2">
                <User size={16} />
                <span>Профіль</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-slate-700 gap-2">
                <Settings size={16} />
                <span>Налаштування</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 font-medium gap-2"
              >
                <LogOut size={16} />
                <span>Вийти з системи</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}