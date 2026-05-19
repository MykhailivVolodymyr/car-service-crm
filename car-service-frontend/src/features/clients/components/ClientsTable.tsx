"use client";

import { ClientDto } from "../types/Client";
import { useRouter } from "next/navigation";
import { Phone, Mail, ArrowRight, Pencil, Trash2, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientsTableProps {
  clients: ClientDto[];
  loading: boolean;
  onEditClick: (client: ClientDto) => void;
  onDeleteClick: (id: number) => void;
}

export default function ClientsTable({ clients, loading, onEditClick, onDeleteClick }: ClientsTableProps) {
  const router = useRouter();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full font-sans antialiased select-none">
        
        {/* ========================================================================= */}
        {/* 💻 ВАРІАНТ 1: КЛАСИЧНА ТАБЛИЦЯ ДЛЯ ВЕЛИКИХ ЕКРАНІВ (md і вище)             */}
        {/* ========================================================================= */}
        <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left table-auto">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Клієнт (ПІБ / Контрагент)</th>
                <th className="px-5 py-3.5 font-bold">Номер телефону</th>
                <th className="px-5 py-3.5 font-bold">Електронна пошта</th>
                <th className="px-5 py-3.5 font-bold text-center w-32">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-slate-700 text-xs font-semibold">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 4 }).map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 font-medium text-sm">
                    Клієнтів за вказаними параметрами пошуку не знайдено
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)} 
                    className="bg-slate-50/40 hover:bg-slate-100/70 border-b border-slate-100/60 cursor-pointer transition-colors group"
                  >
                    {/* ПІБ */}
                    <td className="px-5 py-4 max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-[10px] uppercase shrink-0">
                          {client.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={client.fullName}>
                            {client.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">ID контрагента: #{client.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Телефон */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-800 font-bold tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 max-w-[220px] truncate text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={client.email || ""}>
                          {client.email || <span className="text-slate-300 italic font-normal">не вказано</span>}
                        </span>
                      </div>
                    </td>

                    {/* Кнопки дій */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition border border-blue-100/60 cursor-pointer"
                            >
                              <ArrowRight size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-slate-800">
                            <span>Переглянути профіль</span>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => onEditClick(client)}
                              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition border border-amber-100/60 cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-slate-800">
                            <span>Редагувати профіль</span>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => onDeleteClick(client.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-100/60 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-slate-800">
                            <span>Вилучити з системи</span>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 📱 ВАРІАНТ 2: АДАПТИВНІ UX-КАРТКИ ДЛЯ МОБІЛЬНИХ ПРИСТРОЇВ (менше md)      */}
        {/* ========================================================================= */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-slate-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-slate-50 rounded w-1/2" />
                <div className="h-3 bg-slate-50 rounded w-2/3" />
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm">
              Клієнтів за вказаними параметрами не знайдено
            </div>
          ) : (
            clients.map((client) => (
              <div 
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm space-y-3.5 hover:border-slate-200 active:bg-slate-50/60 transition relative group"
              >
                {/* Шапка картки: Аватар + ПІБ */}
                <div className="flex items-center gap-3 pr-20"> {/* Відступ справа під плаваючі кнопки дій */}
                  <div className="size-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-xs uppercase shrink-0">
                    {client.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight truncate leading-tight">
                      {client.fullName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">ID: #{client.id}</span>
                  </div>
                </div>

                {/* Контактна інформація клієнта */}
                <div className="space-y-2 border-t border-slate-50 pt-3 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-2 text-slate-800 tabular-nums">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {client.email || <span className="text-slate-300 italic font-normal">email не вказано</span>}
                    </span>
                  </div>
                </div>

                {/* Плаваючий блок дій у правому верхньому кутку картки */}
                <div 
                  className="absolute top-3 right-3 flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()} // Захист від спрацьовування кліку по картці
                >
                  <button 
                    onClick={() => onEditClick(client)}
                    className="p-2 bg-slate-50 border border-slate-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 text-slate-400 rounded-xl transition cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    onClick={() => onDeleteClick(client.id)}
                    className="p-2 bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-400 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button 
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="p-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 rounded-xl transition cursor-pointer"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}