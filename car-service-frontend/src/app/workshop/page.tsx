"use client";

import { useEffect, useState } from "react";
import MastersTab from "@/features/masters/components/MastersTab";
import WorkPostsTab from "@/features/masters/components/WorkPostsTab";
import { masterService } from "@/features/masters/services/masterService";
import { UserDto } from "@/features/masters/types/Masters";
import { WorkPostDto } from "@/features/masters/types/WorkPosts";
import { Users, Wrench, UserCheck, LayoutGrid, ToggleLeft, Loader2 } from "lucide-react";

type TabType = "masters" | "posts";

export default function WorkshopPage() {
  const [activeTab, setActiveTab] = useState<TabType>("masters");
  
  // Стейт для збереження даних з обох ендпоінтів для розрахунку статистики
  const [masters, setMasters] = useState<UserDto[]>([]);
  const [posts, setPosts] = useState<WorkPostDto[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Спільна функція завантаження для синхронізації верхньої плашки
  const loadHubStatistics = async () => {
    try {
      setLoadingStats(true);
      const [mastersData, postsData] = await Promise.all([
        masterService.getAllMasters(),
        masterService.getAllWorkPosts()
      ]);
      setMasters(mastersData);
      setPosts(postsData);
    } catch (err) {
      console.error("Помилка збору статистики хабу виробничих ресурсів:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadHubStatistics();
  }, [refreshTrigger]);

  // Функція, яку ми прокинемо в таби, щоб вони могли «штовхати» плашку при змінах
  const triggerGlobalRefresh = () => setRefreshTrigger(p => p + 1);

  // Обчислення метрик «на льоту»
  const totalMasters = masters.length;
  const activeMasters = masters.filter(m => m.isActive).length;
  const totalPosts = posts.length;
  const activePosts = posts.filter(p => p.isActive).length;

  // Масив конфігурації для гарного рендерингу плашок у циклі
  const statsConfig = [
    {
      title: "Всього майстрів",
      value: totalMasters,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50/60 border-blue-100",
    },
    {
      title: "Активні майстри",
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
      title: "Активні пости",
      value: activePosts,
      icon: ToggleLeft,
      color: "text-amber-600",
      bgColor: "bg-amber-50/60 border-amber-100",
    },
  ];

  return (
    /* ОНОВЛЕНО: Прибрано min-h-screen та bg-slate-50/50, встановлено bg-transparent для усунення скролу */
    <div className="space-y-4 font-sans antialiased bg-transparent p-2 sm:p-6 w-full max-w-full">
      
      {/* 👑 НОВА АНАЛІТИЧНА ПЛАШКА ЗВЕРХУ СТОРІНКИ */}
      {loadingStats && masters.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-[74px] bg-white border border-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
          {statsConfig.map((stat, idx) => {
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
      )}

      {/* 1. ВЕРХНЯ ШАПКА ХАБУ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hidden xs:block">
            <Users size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              Виробничі ресурси СТО
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">
              Управління персоналом, екіпажами автослюсарів та coordination робочих постів автосервісу
            </p>
          </div>
        </div>

        {/* 2. СТИЛЬНІ ТАБИ-ПЕРЕМИКАЧІ */}
        <div className="flex items-center gap-1.5 mt-5 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/40">
          <button
            type="button"
            onClick={() => setActiveTab("masters")}
            className={`h-9 px-4 rounded-lg text-xs font-bold gap-2 flex items-center transition-all cursor-pointer ${
              activeTab === "masters"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
            }`}
          >
            <Users size={14} className={activeTab === "masters" ? "text-blue-600" : "text-slate-400"} />
            <span>Екіпаж майстрів</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`h-9 px-4 rounded-lg text-xs font-bold gap-2 flex items-center transition-all cursor-pointer ${
              activeTab === "posts"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
            }`}
          >
            <Wrench size={14} className={activeTab === "posts" ? "text-blue-600" : "text-slate-400"} />
            <span>Робочі пости СТО</span>
          </button>
        </div>
      </div>

      {/* 3. КОНТЕНТ АКТИВНОГО ТАБУ З СИНХРОНІЗАЦІЄЮ ПЛАШКИ */}
      <div className="w-full">
        {activeTab === "masters" ? (
          <div className="animate-in fade-in duration-150">
            {/* Передаємо тригер оновлення, щоб плашка реагувала на зміни в табі */}
            <MastersTab />
          </div>
        ) : (
          <div className="animate-in fade-in duration-150">
            <WorkPostsTab />
          </div>
        )}
      </div>

    </div>
  );
}