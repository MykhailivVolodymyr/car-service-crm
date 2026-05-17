"use client";

import { useEffect, useState } from "react";
import { mainPageService } from "../services/mainPageService";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FullCalendarModal from "@/components/myComponents/FullCalendarModal";

interface DayInfo {
  dateStr: string;      
  dayName: string;      
  dayNumber: string;    
  count: number;        
}

export default function WeeklyCalendarStrip() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const selectedDate = searchParams.get("date") || undefined;

  const [days, setDays] = useState<DayInfo[]>([]);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  useEffect(() => {
    const loadWeeklyCounts = async () => {
      try {
        const generatedDays: DayInfo[] = [];
        const now = new Date();

        for (let i = 0; i < 7; i++) {
          const currentDay = addDays(now, i);
          generatedDays.push({
            dateStr: format(currentDay, "yyyy-MM-dd"),
            dayName: format(currentDay, "eeeeee", { locale: uk }),
            dayNumber: format(currentDay, "d"),
            count: 0
          });
        }

        const startPeriod = startOfDay(now).toISOString();
        const endPeriod = endOfDay(addDays(now, 6)).toISOString();
        const weeklyData = await mainPageService.getSchedulesByPeriod(startPeriod, endPeriod);

        const updatedDays = generatedDays.map(day => {
          const matchCount = weeklyData.filter(schedule => {
            if (!schedule.startTime) return false;
            return schedule.startTime.startsWith(day.dateStr);
          }).length;

          return { ...day, count: matchCount };
        });

        setDays(updatedDays);
      } catch (err) {
        console.error("Помилка завантаження лічильників календаря:", err);
      }
    };

    loadWeeklyCounts();
  }, [searchParams]);

 const handleDateClick = (dateStr: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (dateStr) {
      params.set("date", dateStr);
    } else {
      params.delete("date");
    }
    
    router.push(`/?${params.toString()}`);
  };

  const getDayBgColor = (count: number, isSelected: boolean) => {
    if (isSelected) return "bg-blue-600 text-white border-blue-600 shadow-sm";
    if (count === 0) return "bg-white text-slate-700 border-slate-200/70 hover:bg-slate-50";
    if (count <= 3) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-50";
    if (count <= 6) return "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700";
    return "bg-amber-500 text-white border-amber-500 hover:bg-amber-600";
  };

  return (
    <div className="flex items-center gap-2.5 font-sans select-none w-full max-w-xl lg:max-w-2xl">
      
      {/* Стрічка 7 днів тижня */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          
          return (
            <div
              key={day.dateStr}
              onClick={() => handleDateClick(isSelected ? undefined : day.dateStr)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl border text-center transition cursor-pointer h-12 min-w-[42px] sm:min-w-[55px] ${getDayBgColor(day.count, isSelected)}`}
            >
              <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                {day.dayName}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-xs font-black tracking-tight">{day.dayNumber}</span>
                {day.count > 0 && (
                  <span className={`text-[8px] font-black px-1 rounded-sm ${isSelected ? "bg-white text-blue-600" : "bg-emerald-500 text-white"}`}>
                    {day.count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* КНОПКА "КАЛЕНДАР" */}
      <div className="shrink-0 pl-0.5">
        <button
          onClick={() => setIsFullCalendarOpen(true)}
          className="flex flex-col items-center justify-center h-12 w-14 sm:w-16 rounded-xl border border-dashed border-slate-300/90 bg-white text-slate-500 font-bold transition-all duration-200 hover:bg-blue-50/40 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm cursor-pointer shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.02)] group"
        >
          <Calendar size={16} className="text-blue-500 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[8px] uppercase tracking-wider mt-1 block font-black text-slate-500 group-hover:text-blue-600">
            Календар
          </span>
        </button>
      </div>

      <FullCalendarModal 
        isOpen={isFullCalendarOpen}
        onClose={() => setIsFullCalendarOpen(false)}
        onDateSelect={handleDateClick}
      />
    </div>
  );
}