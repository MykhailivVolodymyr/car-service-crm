"use client";

import { useState, useEffect } from "react";
import { ScheduleFilterDto, MasterUserDto, WorkPostDto } from "../types/Schedule";
import { Search, Calendar, User, LayoutGrid, SlidersHorizontal, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleFiltersProps {
  filters: ScheduleFilterDto;
  onFilterChange: (newFilters: ScheduleFilterDto) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  totalCount: number;
  posts: WorkPostDto[]; 
  masters: MasterUserDto[]; 
}

export default function ScheduleFilters({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  totalCount,
  posts,
  masters,
}: ScheduleFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Автоматично розгортаємо панель фільтрів, якщо дата прийшла з календаря в хедері
  useEffect(() => {
    if (filters.date) {
      setIsExpanded(true);
    }
  }, [filters.date]);

  const handleChange = (key: keyof ScheduleFilterDto, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  return (
    <div className="w-full space-y-3 font-sans select-none antialiased">
      
      {/* ВЕРХНЯ ПАНЕЛЬ: ЗАГОЛОВОК, ЛІЧИЛЬНИК ТА КНОПКИ КЕРУВАННЯ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl shadow-sm px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Записи клієнтів автосервісу</h2>
          <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
            {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-10 text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all duration-200 border-slate-200/80 hover:shadow-sm ${
              isExpanded ? "bg-slate-100 text-slate-800 border-slate-300/40" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Фільтри</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>

          <Button
            variant="outline"
            onClick={onClearFilters}
            className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all duration-200"
          >
            <XCircle size={14} className="text-slate-400" />
            <span>Очистити</span>
          </Button>

          <Button
            variant="outline"
            onClick={onRefresh}
            className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all duration-200"
          >
            <RefreshCw size={14} className="text-slate-400" />
            <span>Оновити</span>
          </Button>
        </div>
      </div>

      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      {isExpanded && (
        <div className="w-full bg-white border border-slate-100 rounded-xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Пошук */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Пошук (авто, клієнт)..."
              value={filters.searchTerm || ""}
              onChange={(e) => handleChange("searchTerm", e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/40 text-xs font-medium"
            />
          </div>

          {/* Фільтр по даті — синхронізований із хедера */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full pl-9 pr-3 h-10 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/40 text-xs font-medium cursor-pointer"
            />
          </div>

          {/* Фільтр по постах */}
          <div className="relative">
            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={filters.postId || ""}
              onChange={(e) => handleChange("postId", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full pl-9 pr-8 h-10 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/40 text-xs font-semibold appearance-none cursor-pointer"
            >
              <option value="">Всі пости (бокси)</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.name}
                </option>
              ))}
            </select>
          </div>

          {/* Фільтр по майстрах */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={filters.mechanicId || ""}
              onChange={(e) => handleChange("mechanicId", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full pl-9 pr-8 h-10 border border-slate-200/80 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/40 text-xs font-semibold appearance-none cursor-pointer"
            >
              <option value="">Всі майстри</option>
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.fullName}
                </option>
              ))}
            </select>
          </div>

        </div>
      )}

    </div>
  );
}