"use client";

import { useEffect, useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameDay 
} from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Car, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mainPageService } from "@/features/mainPage/services/mainPageService";
import { ScheduleDto } from "@/features/mainPage/types/Schedule";

interface FullCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (dateStr: string) => void;
}

interface DayCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  count: number;
}

export default function FullCalendarModal({ isOpen, onClose, onDateSelect }: FullCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentMonth).toISOString();
      const end = endOfMonth(currentMonth).toISOString();
      const data = await mainPageService.getSchedulesByPeriod(start, end);
      setSchedules(data);
    } catch (err) {
      console.error("Помилка завантаження місячного календаря:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMonthData();
    }
  }, [currentMonth, isOpen]);

  if (!isOpen) return null;

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const generateCalendarCells = (): DayCell[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });

    let startDayOfWeek = getDay(start) - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const cells: DayCell[] = [];

    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDay = addMonths(start, -1);
      cells.push({
        date: prevDay,
        dateStr: "",
        isCurrentMonth: false,
        count: 0
      });
    }

    daysInMonth.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayCount = schedules.filter(s => s.startTime && s.startTime.startsWith(dateStr)).length;

      cells.push({
        date: day,
        dateStr,
        isCurrentMonth: true,
        count: dayCount
      });
    });

    return cells;
  };

  const cells = generateCalendarCells();

  const getCellStyles = (cell: DayCell) => {
    if (!cell.isCurrentMonth) return "bg-slate-50/40 border-transparent text-transparent pointer-events-none";
    
    const today = new Date();
    const isToday = isSameDay(cell.date, today);

    let colors = "bg-white text-slate-800 border-slate-100 hover:bg-slate-50";
    if (cell.count > 0 && cell.count <= 3) colors = "bg-emerald-500/5 text-slate-800 border-emerald-500/20 hover:bg-emerald-50/60";
    if (cell.count > 3 && cell.count <= 6) colors = "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700";
    if (cell.count > 6) colors = "bg-amber-500 text-white border-amber-500 hover:bg-amber-600";

    return `${colors} ${isToday ? "ring-2 ring-blue-500 ring-offset-1 font-black" : ""}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-[720px] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 font-sans antialiased text-xs font-semibold text-slate-600">
        
        <DialogHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">Повний календар СТО</DialogTitle>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Перегляд завантаженості замовлень по днях місяця</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 pr-6">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 cursor-pointer">
              <ChevronLeft size={16} />
            </Button>
            
            <span className="text-sm font-bold text-slate-800 min-w-[110px] text-center capitalize">
              {format(currentMonth, "LLLL yyyy", { locale: uk })}
            </span>
            
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 cursor-pointer">
              <ChevronRight size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {weekDays.map(day => <div key={day} className="py-1">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {loading ? (
              Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 border border-slate-100/70 rounded-xl animate-pulse" />
              ))
            ) : (
              cells.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      onDateSelect(cell.dateStr);
                      onClose();
                    }
                  }}
                  className={`h-16 border rounded-xl p-2 flex flex-col justify-between transition text-left cursor-pointer select-none ${getCellStyles(cell)}`}
                >
                  <span className="text-xs font-bold tracking-tight">
                    {cell.isCurrentMonth ? format(cell.date, "d") : ""}
                  </span>

                  {/* ДОДАНО: Плашка з іконкою автомобіля або ключа */}
                  {cell.isCurrentMonth && cell.count > 0 && (
                    <div className={`flex items-center gap-1 mt-auto w-full px-1.5 py-0.5 rounded-md text-[10px] font-black justify-center shadow-sm ${
                      cell.count > 3 ? "bg-white/20 text-white" : "bg-emerald-500 text-white"
                    }`}>
                      {/* Якщо день сильно завантажений (більше 3 машин) - малюємо ключ, інакше машинку */}
                      {cell.count > 3 ? (
                        <Wrench size={10} className="shrink-0" />
                      ) : (
                        <Car size={10} className="shrink-0" />
                      )}
                      <span>
                        {cell.count} {cell.count === 1 ? "запис" : cell.count <= 4 ? "записи" : "записів"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-500/20 rounded-sm inline-block" /> 1-3 машини</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm inline-block" /> 4-6 машин</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm inline-block" /> 7+ машин</span>
          </div>
          <Button variant="ghost" onClick={loadMonthData} className="h-8 gap-1.5 text-slate-500 text-xs hover:bg-slate-50 font-bold rounded-xl cursor-pointer">
            <RefreshCw size={12} /> Оновити дані
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}