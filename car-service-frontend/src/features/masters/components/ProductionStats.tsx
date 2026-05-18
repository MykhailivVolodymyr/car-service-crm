"use client";

import { Users, UserCheck, LayoutGrid, ToggleLeft } from "lucide-react";

interface ProductionStatsProps {
  totalMasters: number;
  activeMasters: number;
  totalPosts: number;
  activePosts: number;
  loading?: boolean;
}

export default function ProductionStats({
  totalMasters,
  activeMasters,
  totalPosts,
  activePosts,
  loading = false
}: ProductionStatsProps) {
  
  const stats = [
    {
      title: "Всього майстрів",
      value: totalMasters,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50/60 border-blue-100",
    },
    {
      title: "Активні зміні",
      value: activeMasters,
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/60 border-emerald-100",
    },
    {
      title: "Робочі пости",
      value: totalPosts,
      icon: LayoutGrid,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/60 border-indigo-100",
    },
    {
      title: "Пости в роботі",
      value: activePosts,
      icon: ToggleLeft,
      color: "text-amber-600",
      bgColor: "bg-amber-50/60 border-amber-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-[72px] sm:h-[80px] bg-white border border-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-md"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
                {stat.title}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight block">
                {stat.value}
              </span>
            </div>
            
            <div className={`size-9 sm:size-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.bgColor}`}>
              <Icon size={18} className={stat.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}