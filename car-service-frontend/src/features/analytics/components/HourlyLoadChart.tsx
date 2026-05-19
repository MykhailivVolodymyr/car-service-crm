"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { HourlyLoadDto, AnalyticsRequestDto } from "../types/Analytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";

export default function HourlyLoadChart({ params }: { params: AnalyticsRequestDto }) {
  const [data, setData] = useState<HourlyLoadDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function FetchData() {
      try {
        setLoading(true);
        const res = await analyticsService.getHourlyLoad(params);
        setData(res);
      } catch (err) {
        console.error("Помилка завантаження погодинного навантаження:", err);
      } finally {
        setLoading(false);
      }
    }
    FetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-[360px] animate-pulse flex items-center justify-center">
        <div className="text-xs font-bold text-slate-400">Завантаження аналітики годин...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col h-[360px] font-sans select-none antialiased">
      
      {/* Заголовок віджета */}
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
          <Clock size={14} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none">Завантаженість по годинах</h3>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Пікові години роботи та напливу автомобілів</span>
        </div>
      </div>

      {/* Контейнер графіка */}
      <div className="w-full flex-1 min-h-0 text-[10px] font-bold text-slate-400">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              {/* Ефект красивого градієнтного переливу для жовтої лінії навантаження СТО */}
              <linearGradient id="hourlyColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="hour" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700"
              }}
              formatter={(value: any) => [`${value} авто`, "Записи"]}
              labelStyle={{ color: "#94a3b8", fontWeight: "800", marginBottom: "4px" }}
            />
            <Area 
              type="monotone" 
              dataKey="appointmentsCount" 
              stroke="#f59e0b" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#hourlyColor)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}