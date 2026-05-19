"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { VehiclePopularityDto, AnalyticsRequestDto } from "../types/Analytics";
import { Car } from "lucide-react";

export default function TopVehiclesList({ params }: { params: AnalyticsRequestDto }) {
  const [vehicles, setVehicles] = useState<VehiclePopularityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getTopVehicles(params)
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm font-sans antialiased select-none flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
          <Car size={14} />
        </div>
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Популярні автомобілі</h3>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-14 bg-slate-50/60 rounded-xl animate-pulse border border-slate-100" />
          ))
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">Немає даних</div>
        ) : (
          vehicles.map((car, index) => (
            <div key={index} className="bg-slate-50/40 border border-slate-100 rounded-xl p-3 flex items-center justify-between transition-colors hover:bg-slate-50/80">
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">
                  {index + 1}. {car.brand} {car.model}
                </div>
                <div className="text-[10px] text-slate-400 font-bold mt-0.5">Марка / Модель</div>
              </div>
              <div className="shrink-0 bg-blue-50/50 border border-blue-100/40 px-2.5 py-1 rounded-lg text-center">
                <div className="text-xs font-black text-blue-600 tabular-nums">{car.visitCount}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">візитів</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}