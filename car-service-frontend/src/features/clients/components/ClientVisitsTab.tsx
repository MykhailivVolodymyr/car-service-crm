"use client";

import { ClientScheduleDto } from "../types/ClientDetails";
import { Wrench, MapPin, Clock, FileCheck, Car } from "lucide-react";

interface ClientVisitsTabProps {
  schedules: ClientScheduleDto[];
}

export default function ClientVisitsTab({ schedules }: ClientVisitsTabProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-xs">
        Немає запланованих чи минулих записів у календарі розкладу для цього водія.
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none font-sans antialiased">
      {schedules.map((item) => (
        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-200/80">
          
          {/* ЛІВА ЧАСТИНА: ЧАС, АВТО ТА ОПИС */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl shrink-0 mt-0.5">
              <Clock size={15} />
            </div>
            
            <div className="space-y-1.5 min-w-0 flex-1">
              {/* Інфо-рядок: Час, Дата, Авто, Наряд */}
              <div className="text-xs font-black text-slate-900 flex flex-wrap items-center gap-1.5">
                <span>{item.startTime.substring(11, 16)} — {item.endTime.substring(11, 16)}</span>
                <span className="text-slate-400 font-medium mr-1">({item.startTime.split('T')[0]})</span>
                
                {/* 👑 ЦІЛЬОВЕ ОНОВЛЕННЯ: Бейдж конкретного автомобіля для цього візиту */}
                {item.vehicleDisplay && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[10px] font-bold tracking-tight">
                    <Car size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[180px]">{item.vehicleDisplay}</span>
                  </span>
                )}

                {/* Крос-зв'язок із замовленням-нарядом (якщо активовано) */}
                {item.orderId && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[9px] font-black uppercase tracking-wide shadow-sm">
                    <FileCheck size={10} /> Наряд №{item.orderId}
                  </span>
                )}
              </div>

              {/* Опис несправності */}
              <p className="text-[11px] text-slate-500 font-medium leading-normal max-w-xl truncate" title={item.description || ""}>
                <strong className="text-slate-700 font-bold">Опис проблеми:</strong> {item.description || "Діагностика та технічне обслуговування (ТО)"}
              </p>
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: МІСЦЕ ТА ВИКОНАВЕЦЬ */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t sm:border-t-0 border-slate-50 pt-2.5 sm:pt-0 text-[11px] font-semibold text-slate-600 shrink-0">
            <div className="flex items-center gap-1 text-slate-700">
              <MapPin size={12} className="text-slate-400" />
              <span>Пост: <strong className="text-blue-600 font-bold">{item.postName}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-700">
              <Wrench size={12} className="text-slate-400" />
              <span>Майстер: <strong className="text-slate-900 font-bold">{item.mechanicName}</strong></span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}