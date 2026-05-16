"use client";

import { ScheduleDto } from "../types/Schedule";
import { Clock, Car, Phone, User, Wrench, Edit2, Trash2, FileText } from "lucide-react";
import { format, differenceInMinutes, isBefore } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleTableProps {
  schedules: ScheduleDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
  onDeleteClick: (id: number) => void; // ДОДАНО: проп для видалення
}

export default function ScheduleTable({ schedules, loading, onEditClick, onDeleteClick }: ScheduleTableProps) {

  // Допоміжна функція для парсингу дати як локальної
  const parseAsLocalDateTime = (dateStr: string) => {
    if (dateStr && dateStr.includes("T")) {
      const cleanStr = dateStr.split(".")[0].replace("Z", "");
      return new Date(cleanStr);
    }
    return new Date(dateStr);
  };

  // Розрахунок залишку часу з підтримкою статусу "Пройшло"
  const getRemainingTimeStatus = (startTimeStr: string) => {
    const now = new Date();
    const start = parseAsLocalDateTime(startTimeStr);
    
    if (isBefore(start, now)) {
      return { text: "Пройшло", isPast: true };
    }

    const diffInMin = differenceInMinutes(start, now);
    const hours = Math.floor(diffInMin / 60);
    const minutes = diffInMin % 60;

    const text = hours > 0 ? `${hours}г ${minutes}хв` : `${minutes}хв`;
    return { text, isPast: false };
  };

  // Форматування діапазону часу
  const formatTimeRange = (startStr: string, endStr: string) => {
    const start = parseAsLocalDateTime(startStr);
    const end = parseAsLocalDateTime(endStr);
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  // Форматування дати
  const formatDateLabel = (startStr: string) => {
    const start = parseAsLocalDateTime(startStr);
    return format(start, "dd MMMM", { locale: uk });
  };

  // ЛОГІКА СОРТУВАННЯ: Майбутні записи -> вгорі від найближчого, Минулі -> опускаються вниз
  const getSortedSchedules = () => {
    const now = new Date();
    
    const futureSchedules = schedules.filter(item => !isBefore(parseAsLocalDateTime(item.startTime), now));
    const pastSchedules = schedules.filter(item => isBefore(parseAsLocalDateTime(item.startTime), now));

    futureSchedules.sort((a, b) => 
      parseAsLocalDateTime(a.startTime).getTime() - parseAsLocalDateTime(b.startTime).getTime()
    );

    pastSchedules.sort((a, b) => 
      parseAsLocalDateTime(b.startTime).getTime() - parseAsLocalDateTime(a.startTime).getTime()
    );

    return [...futureSchedules, ...pastSchedules];
  };

  const sortedItems = getSortedSchedules();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full font-sans antialiased select-none">
        
        {/* 1. ДЕСКТОПНА ВЕРСІЯ */}
        <div className="hidden md:block w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left table-auto min-w-[950px]">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Час / Дата</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Автомобіль</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Клієнт</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Пост</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Майстер</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide">Опис проблеми</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide whitespace-nowrap">Залишилось</th>
                <th className="px-4 py-3.5 font-semibold tracking-wide text-center w-44">Дії</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/60 text-slate-700 text-sm">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, cIdx) => (
                      <td key={cIdx} className="px-4 py-4.5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium text-sm">
                    Записів на вказані параметри не знайдено
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const status = getRemainingTimeStatus(item.startTime);

                  return (
                    <tr key={item.id} className="bg-slate-50/60 hover:bg-[#F8FAFC] transition-colors duration-200">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                          <Clock size={14} className="text-blue-500 shrink-0" />
                          {formatTimeRange(item.startTime, item.endTime)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium pl-5 mt-0.5 capitalize whitespace-nowrap">
                          {formatDateLabel(item.startTime)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Car size={14} className="text-slate-400 shrink-0" />
                          <span>{item.vehicleDisplay || "—"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold flex items-center gap-1.5 text-sm text-slate-900">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span>{item.clientName || "Невідомий"}</span>
                        </div>
                        {item.clientPhone && (
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-1 pl-5 whitespace-nowrap">
                            <Phone size={11} className="text-slate-300 shrink-0" />
                            <span>{item.clientPhone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 border rounded-lg text-xs font-semibold shadow-sm bg-white border-slate-200 text-slate-600">
                          {item.postName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-medium whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Wrench size={13} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{item.mechanicName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs truncate text-xs font-medium text-slate-500">
                        {item.description || <span className="text-slate-300 italic font-normal">Немає опису</span>}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded-md shadow-sm text-white ${status.isPast ? "bg-slate-400" : "bg-amber-500"}`}>
                          {status.text}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => onEditClick(item.id)} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition border border-amber-100/60 cursor-pointer">
                                <Edit2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white font-semibold text-xs rounded-lg px-2.5 py-1"><p>Редагувати</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl transition border border-sky-100/60 cursor-pointer">
                                <User size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white font-semibold text-xs rounded-lg px-2.5 py-1"><p>Історія клієнта</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition border border-emerald-100/60 cursor-pointer">
                                <FileText size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white font-semibold text-xs rounded-lg px-2.5 py-1"><p>Замовлення-наряд</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* ОНОВЛЕНО: Повісили функцію onDeleteClick на червоний смітник */}
                              <button onClick={() => onDeleteClick(item.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-100/60 cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-rose-600 text-white font-semibold text-xs rounded-lg px-2.5 py-1 shadow-md border-0"><p>Видалити запис</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 2. МОБІЛЬНА ВЕРСІЯ */}
        <div className="block md:hidden w-full space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-slate-100 rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm">
              Записів не знайдено
            </div>
          ) : (
            sortedItems.map((item) => {
              const status = getRemainingTimeStatus(item.startTime);

              return (
                <div key={item.id} className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3.5 bg-slate-50/40">
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-2.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <Clock size={14} className="text-blue-500" />
                        <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium mt-0.5 capitalize">{formatDateLabel(item.startTime)}</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm text-white ${status.isPast ? "bg-slate-400" : "bg-amber-500"}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">Автомобіль</span>
                      <div className="flex items-center gap-1 text-slate-900 font-bold mt-0.5">
                        <Car size={13} className="text-slate-400" />
                        <span>{item.vehicleDisplay || "—"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">Пост</span>
                      <div className="mt-0.5">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md font-semibold text-[11px]">
                          {item.postName}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">Клієнт</span>
                      <div className="text-slate-900 font-bold mt-0.5 flex flex-col gap-0.5">
                        <span>{item.clientName || "Невідомий"}</span>
                        {item.clientPhone && <span className="text-[10px] text-slate-400 font-medium">{item.clientPhone}</span>}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">Майстер</span>
                      <div className="flex items-center gap-1 text-slate-800 font-semibold mt-0.5">
                        <Wrench size={12} className="text-slate-400" />
                        <span>{item.mechanicName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/60 rounded-xl p-2.5 text-xs border border-slate-100/50">
                    <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider mb-0.5">Опис проблеми</span>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {item.description || <span className="text-slate-300 italic font-normal">Немає опису</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button onClick={() => onEditClick(item.id)} className="flex justify-center py-2 bg-amber-50 active:bg-amber-100 text-amber-600 rounded-xl border border-amber-100/60 cursor-pointer"><Edit2 size={14} /></button>
                    <button className="flex justify-center py-2 bg-sky-50 active:bg-sky-100 text-sky-600 rounded-xl border border-sky-100/60 cursor-pointer"><User size={14} /></button>
                    <button className="flex justify-center py-2 bg-emerald-50 active:bg-emerald-100 text-emerald-600 rounded-xl border border-emerald-100/60 cursor-pointer"><FileText size={14} /></button>
                    {/* ОНОВЛЕНО: Повісили функцію onDeleteClick на мобільну кнопку */}
                    <button onClick={() => onDeleteClick(item.id)} className="flex justify-center py-2 bg-rose-50 active:bg-rose-100 text-rose-600 rounded-xl border border-rose-100/60 cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}