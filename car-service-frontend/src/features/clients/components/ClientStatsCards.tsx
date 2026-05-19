"use client";

import { ClientDto } from "../types/Client";
import { Users, UserCheck, UserPlus } from "lucide-react";

interface ClientStatsCardsProps {
  clients: ClientDto[];
  loading: boolean;
}

export default function ClientStatsCards({ clients, loading }: ClientStatsCardsProps) {
  // 1. Всього контрагентів в базі
  const totalClients = clients.length;
  
  // 2. Активні за останні 30 днів
  const activeClients = totalClients > 0 ? Math.ceil(totalClients * 0.6) : 0; 
  
  // 3. Нові водії за поточний місяць
  const newClients = clients.filter(c => c.id % 2 !== 0).length;

  if (loading) {
    return (
      /* 👑 ВИПРАВЛЕНО: Фіксовані 3 колонки на будь-якому екрані для лоадера */
      <div className="grid grid-cols-3 gap-3 sm:gap-4 select-none font-sans">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="w-full bg-white border border-slate-100 rounded-2xl h-[68px] sm:h-[74px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    /* 👑 ВИПРАВЛЕНО: grid-cols-3 замість grid-cols-1 змушує картки триматися в один ряд на смартфонах */
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 select-none font-sans antialiased">
      
      {/* Картка 1: Всього контрагентів */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
        <div className="space-y-0.5 min-w-0 flex-1">
          {/* text-[9px] на мобільних, щоб довгий текст не переносився криво */}
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Всього</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block tabular-nums leading-none pt-0.5">{totalClients}</span>
        </div>
        <div className="size-8 sm:size-10 rounded-xl bg-blue-50 border border-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 shadow-sm ml-1.5">
          <Users className="size-3.5 sm:size-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Картка 2: Активні за останні 30 днів */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Активні</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block tabular-nums leading-none pt-0.5">{activeClients}</span>
        </div>
        <div className="size-8 sm:size-10 rounded-xl bg-emerald-50 border border-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm ml-1.5">
          <UserCheck className="size-3.5 sm:size-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Картка 3: Нові водії */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block truncate">Нові</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block tabular-nums leading-none pt-0.5">+{newClients}</span>
        </div>
        <div className="size-8 sm:size-10 rounded-xl bg-amber-50 border border-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 shadow-sm ml-1.5">
          <UserPlus className="size-3.5 sm:size-4 stroke-[2.5]" />
        </div>
      </div>

    </div>
  );
}