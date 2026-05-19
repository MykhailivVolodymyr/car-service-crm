"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { DailyActivityDto, AnalyticsRequestDto } from "../types/Analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { BarChart3 } from "lucide-react";

export default function DailyActivityChart({ params }: { params: AnalyticsRequestDto }) {
  const [data, setData] = useState<DailyActivityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function FetchData() {
      try {
        setLoading(true);
        const res = await analyticsService.getDailyActivity(params);
        setData(res);
      } catch (err) {
        console.error("Помилка завантаження денної активності:", err);
      } finally {
        setLoading(false);
      }
    }
    FetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-[360px] animate-pulse flex items-center justify-center">
        <div className="text-xs font-bold text-slate-400">Завантаження аналітики за днями...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col h-[360px] font-sans select-none antialiased">
      
      {/* Заголовок віджета */}
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
          <BarChart3 size={14} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none">Активність по днях тижня</h3>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Записи та доходи автосервісу за днями</span>
        </div>
      </div>

      {/* Контейнер графіка */}
      <div className="w-full flex-1 min-h-0 text-[10px] font-bold text-slate-400">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="dayName" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              dy={10}
            />
            {/* Ліва вісь для записів */}
            <YAxis 
              yAxisId="left" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              allowDecimals={false}
            />
            {/* Права вісь для доходу */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
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
             formatter={(value: any, name: any) => {
                 if (String(name) === "revenue") {
                return [`${value.toLocaleString()} ₴`, "Дохід"];
            }
  return [value, "Записи"];
}}
              labelStyle={{ color: "#94a3b8", fontWeight: "800", marginBottom: "4px" }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={6}
              formatter={(value) => (value === "appointments" ? "Записи" : "Дохід (₴)")}
            />
            <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} name="appointments" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} name="revenue" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}