"use client";

import { DashboardStats } from "../types/DashboardStats";

interface DashboardStatsCardsProps {
  data: DashboardStats | null;
  loading: boolean;
}

export default function DashboardStatsCards({ data, loading }: DashboardStatsCardsProps) {
  return (
    <div className="w-full font-sans select-none antialiased">
      
      {/* На ПК: суцільний флекс-рядок з лініями розділення.
        На мобільних (hidden md:flex -> grid grid-cols-2): акуратна міні-сітка 2х2 без розпирання.
      */}
      <div className="w-full bg-white border border-slate-100 rounded-xl shadow-sm p-4 md:px-6 md:py-3.5 grid grid-cols-2 md:flex md:flex-wrap md:items-center gap-x-4 gap-y-3 md:gap-x-8 md:gap-y-2 text-xs md:text-sm">
        {loading ? (
          <div className="h-5 w-2/3 bg-slate-100 rounded animate-pulse col-span-2" />
        ) : (
          <>
            {/* Записів сьогодні */}
            <div className="flex items-center gap-2">
              <span className="font-black text-blue-600 text-sm md:text-base tabular-nums">
                {data?.appointmentsToday ?? 0}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Записів сьогодні</span>
            </div>

            {/* За тиждень */}
            <div className="flex items-center gap-2 md:border-l md:pl-8 border-slate-100">
              <span className="font-black text-blue-600 text-sm md:text-base tabular-nums">
                {data?.appointmentsThisWeek ?? 0}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">За тиждень</span>
            </div>

            {/* За місяць */}
            <div className="flex items-center gap-2 md:border-l md:pl-8 border-slate-100">
              <span className="font-black text-blue-600 text-sm md:text-base tabular-nums">
                {data?.appointmentsThisMonth ?? 0}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">За місяць</span>
            </div>

            {/* Всього клієнтів */}
            <div className="flex items-center gap-2 md:border-l md:pl-8 border-slate-100">
              <span className="font-black text-blue-600 text-sm md:text-base tabular-nums">
                {data?.totalClients ?? 0}
              </span>
              <span className="text-slate-500 font-medium whitespace-nowrap">Всього клієнтів</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}