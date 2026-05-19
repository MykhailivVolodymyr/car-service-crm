"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Download } from "lucide-react";
import { useRouter } from "next/navigation"; // 👑 ДОДАНО
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderActionButtonsProps {
  onNewOrderClick: () => void;
  onClientSearchClick?: () => void; // Робимо опціональним, бо тепер кнопка автономна
  onExportClick: () => void;
}

export default function OrderActionButtons({
  onNewOrderClick,
  onExportClick,
}: OrderActionButtonsProps) {
  const router = useRouter(); // 👑 ІНІЦІАЛІЗАЦІЯ РОУТЕРА

  return (
    <TooltipProvider delayDuration={200}>
      {/* Завдяки `grid-cols-3` усе ЗАВЖДИ буде в один рядок — і на телефонах, і на моніторах. */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 font-sans select-none antialiased w-full">
        
        {/* Кнопка 1: Створення замовлення-наряду */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onNewOrderClick}
              className="h-11 sm:h-12 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs gap-2 shadow-sm shadow-blue-500/10 cursor-pointer transition-all duration-200 hover:shadow-md px-2 sm:px-6 tracking-wider uppercase"
            >
              <Plus size={16} className="stroke-[3] shrink-0" />
              <span className="hidden sm:inline">Нове замовлення</span>
              <span className="inline sm:hidden">Нове</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-950 text-white text-xs font-semibold px-2.5 py-1 rounded-lg sm:hidden">
            <p>Нове замовлення</p>
          </TooltipContent>
        </Tooltip>

        {/* Кнопка 2: 👑 ОНОВЛЕНО: Перехід до бази контрагентів */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => router.push("/clients")} // Клікнув — і миттєво в базі клієнтів
              className="h-11 sm:h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer transition-all duration-200 hover:shadow-md px-2 sm:px-6 tracking-wider uppercase"
            >
              <Search size={15} className="shrink-0" />
              <span className="hidden sm:inline">Пошук клієнта</span>
              <span className="inline sm:hidden">Пошук</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-950 text-white text-xs font-semibold px-2.5 py-1 rounded-lg sm:hidden">
            <p>Пошук клієнта</p>
          </TooltipContent>
        </Tooltip>

        {/* Кнопка 3: Експорт звітів */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onExportClick}
              className="h-11 sm:h-12 w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl sm:rounded-2xl font-bold text-xs gap-2 shadow-sm shadow-amber-500/10 cursor-pointer transition-all duration-200 hover:shadow-md px-2 sm:px-6 tracking-wider uppercase"
            >
              <Download size={15} className="shrink-0" />
              <span className="hidden sm:inline">Експорт</span>
              <span className="inline sm:hidden">Експорт</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-950 text-white text-xs font-semibold px-2.5 py-1 rounded-lg sm:hidden">
            <p>Експорт звітів</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}