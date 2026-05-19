"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { ServicePopularityDto, AnalyticsRequestDto } from "../types/Analytics";
import { Wrench } from "lucide-react";

export default function TopServicesList({ params }: { params: AnalyticsRequestDto }) {
  const [services, setServices] = useState<ServicePopularityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getTopServices(params)
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm font-sans antialiased select-none flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
          <Wrench size={14} />
        </div>
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Топ послуг за доходом</h3>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-slate-50/60 rounded-xl animate-pulse border border-slate-100" />
          ))
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-xs">Немає даних за цей період</div>
        ) : (
          services.map((service, index) => (
            <div key={index} className="bg-slate-50/40 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between transition-colors hover:bg-slate-50/80">
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">
                  {index + 1}. {service.serviceName}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {service.usageCount} виконано
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-emerald-600 tabular-nums">
                  {service.totalRevenue.toLocaleString()} ₴
                </div>
                <div className="text-[9px] text-slate-400 font-semibold tabular-nums mt-0.5">
                  ~{(service.totalRevenue / (service.usageCount || 1)).toFixed(0)} ₴ / раз
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}