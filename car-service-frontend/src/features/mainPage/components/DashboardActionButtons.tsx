"use client";

import { PlusCircle, Search, Wrench, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardActionButtonsProps {
  onNewScheduleClick: () => void; // Додаємо обов'язковий проп кліку
}

export default function DashboardActionButtons({ onNewScheduleClick }: DashboardActionButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3.5 w-full font-sans select-none antialiased">
      
      {/* Кнопка 1: Новий запис — тепер викликає модалку */}
      <Button 
        onClick={onNewScheduleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200"
      >
        <PlusCircle size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Новий запис</span>
      </Button>

      {/* Решта кнопок залишається без змін... */}
      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200">
        <Search size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Пошук клієнта</span>
      </Button>

      <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200">
        <Wrench size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Майстри</span>
      </Button>

      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-10 md:h-12 rounded-xl text-xs md:text-sm font-bold gap-2 cursor-pointer shadow-sm transition-all duration-200">
        <Download size={16} className="shrink-0 md:size-[18px]" />
        <span className="hidden sm:inline">Експорт</span>
      </Button>

    </div>
  );
}