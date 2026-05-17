"use client";

import { OrderStats } from "../types/Order";
import { ClipboardList, Wrench, Hourglass, CheckCircle2 } from "lucide-react";

interface OrderStatsCardsProps {
  stats: OrderStats;
  loading: boolean;
}

export default function OrderStatsCards({ stats, loading }: OrderStatsCardsProps) {
  const cardsConfig = [
    {
      title: "Нові",
      fullTitle: "Нові замовлення",
      value: stats.newCount,
      icon: ClipboardList,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50/60",
      borderColor: "border-blue-100/70",
      description: "Очікують на первинний огляд та дефектовку",
    },
    {
      title: "В роботі",
      fullTitle: "В роботі",
      value: stats.inProgressCount,
      icon: Wrench,
      textColor: "text-amber-500",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-100/70",
      description: "Машини, які прямо зараз ремонтуються в боксах",
    },
    {
      title: "Запчастини",
      fullTitle: "Очікує запчастини",
      value: stats.waitingPartsCount,
      icon: Hourglass,
      textColor: "text-rose-500",
      bgColor: "bg-rose-50/50",
      borderColor: "border-rose-100/70",
      description: "Ремонт призупинено, деталі замовлено у постачальників",
    },
    {
      title: "Готові",
      fullTitle: "Готово до видачі",
      value: stats.readyCount,
      icon: CheckCircle2,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50/60",
      borderColor: "border-emerald-100/70",
      description: "Роботи завершено, автомобілі чекають на клієнтів",
    },
  ];

  return (
    // grid-cols-2 для мобільних — тепер 4 плашки займуть мінімум місця (всього 2 рядочки)
    // sm:grid-cols-2 для планшетів, lg:grid-cols-4 для десктопу
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 font-sans select-none antialiased w-full">
      {cardsConfig.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className={`bg-white border ${card.borderColor} rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md`}
          >
            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              {/* Короткий заголовок на мобільних, повний — на десктопі */}
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold block truncate">
                <span className="inline sm:hidden">{card.title}</span>
                <span className="hidden sm:inline">{card.fullTitle}</span>
              </span>
              
              {loading ? (
                <div className="h-6 sm:h-7 bg-slate-100 rounded w-10 animate-pulse mt-1" />
              ) : (
                <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight block">
                  {card.value}
                </span>
              )}
              
              {/* Опис повністю ховаємо на мобільних, щоб не розпирало висоту картки */}
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium leading-normal max-w-[170px]">
                {card.description}
              </p>
            </div>

            {/* Зменшена та адаптивна іконка-бейдж для мобільних */}
            <div className={`p-2 sm:p-3.5 ${card.bgColor} ${card.textColor} rounded-lg sm:rounded-2xl border ${card.borderColor} shrink-0 shadow-sm ml-2`}>
              {/* На мобільних міняємо size з 20 на 15 */}
              <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}