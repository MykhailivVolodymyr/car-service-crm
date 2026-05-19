"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService";
import { GeneralAnalyticsDto, AnalyticsRequestDto } from "../types/Analytics";
import { Calendar, CheckCircle2, Percent, DollarSign, Wallet, BarChart3 } from "lucide-react";

export default function GeneralStats({ params }: { params: AnalyticsRequestDto }) {
  const [data, setData] = useState<GeneralAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await analyticsService.getGeneral(params);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 select-none font-sans">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 h-[78px] animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Форматування значень: перевіряємо на наявність дробової частини та обмежуємо до 2 знаків
  const formatPercentage = (val: number) => {
    return val % 1 === 0 ? `${val}%` : `${val.toFixed(2)}%`;
  };

  const formatCurrency = (val: number) => {
    return val % 1 === 0 ? `${val.toLocaleString()} ₴` : `${val.toFixed(2).toLocaleString()} ₴`;
  };

  const statItems = [
    { title: "Всього записів", value: data.totalAppointments, icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
    { title: "Виконано", value: data.completedOrders, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { title: "Конверсія", value: formatPercentage(data.conversionRate), icon: Percent, bg: "bg-cyan-50", text: "text-cyan-600" },
    { title: "Загальний дохід", value: formatCurrency(data.totalRevenue), icon: DollarSign, bg: "bg-amber-50", text: "text-amber-600" },
    { title: "Середній чек", value: formatCurrency(data.averageCheck), icon: Wallet, bg: "bg-rose-50", text: "text-rose-600" },
    { title: "Записів/День", value: data.avgAppointmentsPerDay ? Number(data.avgAppointmentsPerDay.toFixed(2)) : 0, icon: BarChart3, bg: "bg-slate-50", text: "text-slate-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 select-none font-sans antialiased">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">{item.title}</span>
              <span className="text-xl font-black text-slate-900 block tabular-nums leading-none pt-1">{item.value}</span>
            </div>
            <div className={`size-9 rounded-xl ${item.bg} ${item.text} flex items-center justify-center shrink-0 shadow-sm ml-2`}>
              <Icon size={16} className="stroke-[2.5]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}