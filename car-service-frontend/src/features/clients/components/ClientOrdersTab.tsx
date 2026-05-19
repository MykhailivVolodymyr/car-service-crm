"use client";

import { ClientOrderDto } from "../types/ClientDetails";
import { FileText, Calendar } from "lucide-react";

interface ClientOrdersTabProps {
  orders: ClientOrderDto[];
}

export default function ClientOrdersTab({ orders }: ClientOrdersTabProps) {
  const getStatusStyle = (id: number) => {
    if (id === 4) return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (id === 2) return "bg-amber-50 text-amber-600 border-amber-200/80";
    return "bg-blue-50 text-blue-600 border-blue-200";
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-xs">
        Фінансової історії ремонтів та замовлень-нарядів для цього клієнта не знайдено.
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden select-none">
      <table className="w-full border-collapse text-left table-auto">
        <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="px-4 py-3 font-bold">Наряд</th>
            <th className="px-4 py-3 font-bold">Автомобіль</th>
            <th className="px-4 py-3 font-bold text-center">Статус</th>
            <th className="px-4 py-3 font-bold">Пробіг</th>
            <th className="px-4 py-3 font-bold text-right">Сума</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60 text-slate-700 text-xs font-semibold">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50/50 transition">
              <td className="px-4 py-3.5">
                <div className="text-xs font-black text-slate-900">№ {order.id}</div>
                <div className="text-[9px] text-slate-400 font-medium mt-0.5 flex items-center gap-0.5">
                  <Calendar size={10} /> {new Date(order.createdAt.split('T')[0]).toLocaleDateString("uk-UA")}
                </div>
              </td>
              <td className="px-4 py-3.5 max-w-[180px] truncate font-bold text-slate-800" title={order.vehicleDetails}>
                {order.vehicleDetails}
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className={`px-2 py-0.5 border rounded text-[9px] font-black uppercase tracking-wide ${getStatusStyle(order.statusId)}`}>
                  {order.statusName}
                </span>
              </td>
              <td className="px-4 py-3.5 text-slate-500 font-medium tabular-nums">
                {order.mileage ? `${order.mileage.toLocaleString()} км` : "—"}
              </td>
              <td className="px-4 py-3.5 text-sm font-black text-slate-900 text-right tabular-nums">
                {order.totalAmount.toLocaleString()} ₴
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}