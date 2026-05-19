"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";

interface ClientActionButtonsProps {
  onNewClientClick: () => void;
  onRefresh: () => void;
  totalCount: number;
}

export default function ClientActionButtons({ onNewClientClick, onRefresh, totalCount }: ClientActionButtonsProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm select-none font-sans antialiased">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-black text-slate-800 tracking-tight">Зареєстровані клієнти СТО</h2>
        <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
          {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onRefresh} 
          className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all duration-200"
        >
          <RefreshCw size={14} className="text-slate-400" />
          <span>Оновити</span>
        </Button>
        <Button 
          type="button" 
          onClick={onNewClientClick} 
          className="h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 shadow-sm px-4 cursor-pointer transition-all duration-200"
        >
          <UserPlus size={14} /> <span>Додати клієнта</span>
        </Button>
      </div>
    </div>
  );
}