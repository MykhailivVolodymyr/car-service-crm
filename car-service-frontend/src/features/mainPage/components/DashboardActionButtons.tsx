"use client";

import { PlusCircle, Search, Wrench, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DashboardActionButtonsProps {
  onNewScheduleClick: () => void;
  onExportClick: () => void; 
}

export default function DashboardActionButtons({ onNewScheduleClick, onExportClick }: DashboardActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3.5 w-full font-sans select-none antialiased">
      
      {/* Кнопка 1: Новий запис */}
      <Button 
        onClick={onNewScheduleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200"
      >
        <PlusCircle size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Новий запис</span>
      </Button>

      {/* Кнопка 2: 👑 ОНОВЛЕНО: Пошук клієнта (Тепер перенаправляє на сторінку /clients) */}
      <Button 
        onClick={() => router.push("/clients")}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200"
      >
        <Search size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Пошук клієнта</span>
      </Button>

      {/* Кнопка 3: Майстри */}
      <Button 
        onClick={() => router.push("/workshop")} 
        className="w-full bg-sky-500 hover:bg-sky-600 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200"
      >
        <Wrench size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Майстри</span>
      </Button>

      {/* Кнопка 4: Експорт */}
      <Button 
        onClick={onExportClick} 
        className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200"
      >
        <Download size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Експорт</span>
      </Button>

    </div>
  );
}