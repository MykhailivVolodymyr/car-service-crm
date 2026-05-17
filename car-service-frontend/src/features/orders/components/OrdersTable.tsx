"use client";

import { OrderDto } from "../types/Order";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useRouter } from "next/navigation"; // ДОДАНО для навігації
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Car, 
  User, 
  Phone, 
  Edit2, 
  FileText, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersTableProps {
  orders: OrderDto[];
  loading: boolean;
  onEditClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
  onPrintClick: (id: number) => void;
}

export default function OrdersTable({
  orders,
  loading,
  onEditClick,
  onDeleteClick,
  onPrintClick,
}: OrdersTableProps) {
  const router = useRouter(); // Ініціалізуємо роутер Next.js

  const getStatusBadgeClass = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "bg-blue-50 text-blue-600 border-blue-200";
      case 2:
        return "bg-amber-50 text-amber-600 border-amber-200/80";
      case 3:
        return "bg-rose-50 text-rose-600 border-rose-200/80";
      case 4:
        return "bg-emerald-50 text-emerald-600 border-emerald-200/80";
      case 5:
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const cleanStr = dateStr.split(".")[0].replace("Z", "");
      return format(new Date(cleanStr), "dd MMMM yyyy, HH:mm", { locale: uk });
    } catch {
      return "Невідома дата";
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full font-sans antialiased select-none">
        
        {/* 1. ДЕСКТОПНА ВЕРСІЯ ТАБЛИЦІ */}
        <div className="hidden md:block w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 px-5 font-bold text-slate-500">Номер / Дата</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Автомобіль</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Клієнт</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Статус</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Сума</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Нотатки</TableHead>
                <TableHead className="h-11 px-5 font-bold text-center text-slate-500 w-40">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-700 text-xs font-semibold">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, cIdx) => (
                      <TableCell key={cIdx} className="p-4"><div className="h-4 bg-slate-100 rounded w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                    Активних замовлень-нарядів у базі даних не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const isPrintAllowed = order.statusId === 4 || order.statusId === 5;

                  return (
                    /* ОНОВЛЕНО: додано onClick для переходу на детальну сторінку та класи ефекту наведення */
                    <TableRow 
                      key={order.id} 
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="bg-slate-50/40 hover:bg-slate-100/70 transition-colors border-b border-slate-100/60 cursor-pointer group"
                    >
                      
                      <TableCell className="p-4 whitespace-nowrap">
                        <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">№ {order.id}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{formatOrderDate(order.createdAt)}</div>
                      </TableCell>

                      <TableCell className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Car size={14} className="text-slate-400 shrink-0" />
                          <span>{order.vehicleDetails}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium pl-5 mt-0.5">
                          {order.mileage ? `${order.mileage.toLocaleString()} км` : "Пробіг не вказано"}
                        </div>
                      </TableCell>

                      <TableCell className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span>{order.clientName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 pl-4.5">
                          <Phone size={11} className="text-slate-300 shrink-0" />
                          <span>{order.clientPhone}</span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 border rounded-md text-[10px] font-black shadow-sm tracking-wide uppercase ${getStatusBadgeClass(order.statusId)}`}>
                          {order.statusName}
                        </span>
                      </TableCell>

                      <TableCell className="p-4 whitespace-nowrap text-sm font-black text-slate-900">
                        {order.totalAmount.toLocaleString()} грн
                      </TableCell>

                      <TableCell className="p-4 max-w-xs truncate text-[11px] font-medium text-slate-500">
                        {order.notes || <span className="text-slate-300 italic font-normal">Відсутні</span>}
                      </TableCell>

                      {/* ОНОВЛЕНО: на кожну кнопку дій додано e.stopPropagation(), щоб клік не провалювався в перехід на іншу сторінку */}
                      <TableCell className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Редагувати замовлення */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => onEditClick(order.id)} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition border border-amber-100/60 cursor-pointer">
                                <Edit2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800">
                              <span>Редагувати замовлення</span>
                            </TooltipContent>
                          </Tooltip>

                          {/* Друк замовлення-наряду */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => isPrintAllowed && onPrintClick(order.id)} 
                                disabled={!isPrintAllowed}
                                className={`p-2 rounded-xl transition border text-emerald-600 ${
                                  isPrintAllowed 
                                    ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-100/60 cursor-pointer" 
                                    : "opacity-30 bg-slate-50 border-slate-200 cursor-not-allowed"
                                }`}
                              >
                                <FileText size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800 max-w-[220px] text-center">
                              {isPrintAllowed ? (
                                <span>Сформувати замовлення-наряд (PDF)</span>
                              ) : (
                                <span className="text-rose-400">Рахунок доступний лише у статусі &apos;Готово&apos; або &apos;Закрито&apos;</span>
                              )}
                            </TooltipContent>
                          </Tooltip>

                          {/* Видалити замовлення */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => onDeleteClick(order.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-100/60 cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800">
                              <span>Видалити замовлення</span>
                            </TooltipContent>
                          </Tooltip>

                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* 2. МОБІЛЬНА ВЕРСІЯ ТАБЛИЦІ */}
        <div className="block md:hidden w-full space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-slate-100 rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm">
              Замовлень не знайдено
            </div>
          ) : (
            orders.map((order) => {
              const isPrintAllowed = order.statusId === 4 || order.statusId === 5;

              return (
                /* ОНОВЛЕНО: додано onClick для мобільної картки */
                <div 
                  key={order.id} 
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3.5 bg-slate-50/40 cursor-pointer hover:border-slate-200 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-100/80 pb-2.5">
                    <div>
                      <div className="text-sm font-black text-slate-900">№ {order.id}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{formatOrderDate(order.createdAt)}</span>
                    </div>
                    <span className="px-2 py-0.5 border rounded-md text-[9px] font-black tracking-wide uppercase ${getStatusBadgeClass(order.statusId)}">
                      {order.statusName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Автомобіль</span>
                      <div className="flex items-center gap-1 text-slate-900 font-bold mt-0.5">
                        <Car size={13} className="text-slate-400" />
                        <span className="truncate max-w-[120px]">{order.vehicleDetails}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Сума до сплати</span>
                      <div className="text-slate-900 font-black mt-0.5 text-sm">{order.totalAmount.toLocaleString()} грн</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Клієнт</span>
                      <div className="text-slate-900 font-bold mt-0.5">
                        <div>{order.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{order.clientPhone}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Пробіг</span>
                      <div className="text-slate-600 mt-0.5">{order.mileage ? `${order.mileage.toLocaleString()} км` : "—"}</div>
                    </div>
                  </div>

                  {/* ОНОВЛЕНО: блокуємо спливання і на мобільних кнопках дій */}
                  <div className="grid grid-cols-3 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onEditClick(order.id)} className="flex justify-center py-2 bg-amber-50 rounded-xl border border-amber-100/60 text-amber-600 cursor-pointer"><Edit2 size={14} /></button>
                    
                    <button 
                      onClick={() => isPrintAllowed && onPrintClick(order.id)} 
                      disabled={!isPrintAllowed}
                      className={`flex justify-center py-2 rounded-xl border text-emerald-600 ${
                        isPrintAllowed 
                          ? "bg-emerald-50 border-emerald-100/60 cursor-pointer" 
                          : "opacity-20 bg-slate-50 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      <FileText size={14} />
                    </button>
                    
                    <button onClick={() => onDeleteClick(order.id)} className="flex justify-center py-2 bg-rose-50 rounded-xl border border-rose-100/60 text-rose-600 cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}