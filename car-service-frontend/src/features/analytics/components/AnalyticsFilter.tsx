"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { AnalyticsRequestDto } from "../types/Analytics";

interface AnalyticsFilterProps {
  onFilterChange: (params: AnalyticsRequestDto) => void;
}

export default function AnalyticsFilter({ onFilterChange }: AnalyticsFilterProps) {
  const [activePeriod, setActivePeriod] = useState<"week" | "month" | "quarter" | "custom">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePeriodClick = (period: "week" | "month" | "quarter") => {
    setActivePeriod(period);
    onFilterChange({ periodType: period, startDate: null, endDate: null });
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) return;
    setActivePeriod("custom");
    onFilterChange({ periodType: "custom", startDate, endDate });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center gap-4 w-full font-sans antialiased select-none">
      
      {/* Група швидких періодів */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
        <Button 
          variant={activePeriod === "week" ? "default" : "ghost"}
          onClick={() => handlePeriodClick("week")}
          className={`h-9 text-xs font-bold rounded-xl px-5 transition-all ${
            activePeriod === "week" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Тиждень
        </Button>
        <Button 
          variant={activePeriod === "month" ? "default" : "ghost"}
          onClick={() => handlePeriodClick("month")}
          className={`h-9 text-xs font-bold rounded-xl px-5 transition-all ${
            activePeriod === "month" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Місяць
        </Button>
        <Button 
          variant={activePeriod === "quarter" ? "default" : "ghost"}
          onClick={() => handlePeriodClick("quarter")}
          className={`h-9 text-xs font-bold rounded-xl px-5 transition-all ${
            activePeriod === "quarter" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          Квартал
        </Button>
      </div>

      {/* Розділювач */}
      <div className="hidden md:block h-6 w-[1px] bg-slate-100" />

      {/* Поля вибору дат */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">З:</span>
        <Input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-9 w-full md:w-36 rounded-xl border-slate-200 text-xs font-bold text-slate-600 focus:border-blue-500 transition-colors" 
        />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">По:</span>
        <Input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-9 w-full md:w-36 rounded-xl border-slate-200 text-xs font-bold text-slate-600 focus:border-blue-500 transition-colors" 
        />
        
        <Button 
          onClick={handleApplyCustom}
          disabled={!startDate || !endDate}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4 gap-1.5 shrink-0 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={13} /> <span>Застосувати</span>
        </Button>
      </div>
    </div>
  );
}