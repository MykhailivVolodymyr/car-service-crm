"use client";

import { useEffect, useState } from "react";
import { masterService } from "../services/masterService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Clock, Wrench, Loader2, Calendar } from "lucide-react";
import { MasterPerformanceDto } from "../types/Masters";

interface MasterAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterId: number | null;
  masterName: string;
}

export default function MasterAnalyticsModal({ isOpen, onClose, masterId, masterName }: MasterAnalyticsModalProps) {
  const [stats, setStats] = useState<MasterPerformanceDto | null>(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !masterId) return;

    const loadPerformance = async () => {
      try {
        setLoading(true);
        const data = await masterService.getMasterPerformance(period);
        // Оскільки бек повертає масив по всіх майстрах, шукаємо потрібного нам за ID
        const masterStats = data.find(m => m.masterId === masterId);
        
        if (masterStats) {
          setStats(masterStats);
        } else {
          // Якщо майстер новий і ще не має замовлень у цьому періоді, обнуляємо метрики
          setStats({
            masterId,
            masterName,
            ordersCount: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            totalWorkHours: 0
          });
        }
      } catch (err) {
        console.error("Помилка завантаження аналітики майстра:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, [isOpen, masterId, period]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[460px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans antialiased">
        
        <DialogHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between justify-items-center">
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <BarChart3 className="text-blue-600" size={18} />
            <span>Продуктивність: <span className="text-blue-600">{masterName}</span></span>
          </DialogTitle>
          
          {/* Селектор періоду аналітики */}
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="h-8 px-2.5 mr-6 border border-slate-200 rounded-lg bg-white font-bold text-[11px] text-slate-600 cursor-pointer outline-none shadow-sm"
          >
            <option value="week">За тиждень</option>
            <option value="month">За місяць</option>
            <option value="quarter">За квартал</option>
          </select>
        </DialogHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Розрахунок КРІ...</span>
          </div>
        ) : stats ? (
          <div className="space-y-4 mt-4 select-none">
            
            {/* СІТКА МЕТРИК ЕФЕКТИВНОСТІ */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Кількість замовлень */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Виконано замовлень</span>
                  <span className="text-lg font-black text-slate-800 block mt-0.5">{stats.ordersCount} замовл.</span>
                </div>
                <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Wrench size={14} /></div>
              </div>

              {/* Загальна виручка */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Загальна виручка</span>
                  <span className="text-lg font-black text-emerald-600 block mt-0.5">{stats.totalRevenue.toLocaleString()} ₴</span>
                </div>
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><DollarSign size={14} /></div>
              </div>

              {/* Середній чек */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Середній чек</span>
                  <span className="text-lg font-black text-indigo-600 block mt-0.5">{stats.averageOrderValue.toLocaleString()} ₴</span>
                </div>
                <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><TrendingUp size={14} /></div>
              </div>

              {/* Години роботи */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Відпрацьовано годин</span>
                  <span className="text-lg font-black text-amber-600 block mt-0.5">{stats.totalWorkHours.toFixed(1)} г.</span>
                </div>
                <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock size={14} /></div>
              </div>

            </div>

            {/* Маленька виноска для диплома */}
            <div className="p-2.5 bg-blue-50/30 border border-blue-100/50 rounded-xl flex items-start gap-2 text-[10px] text-slate-400 font-medium leading-relaxed">
              <Calendar size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Аналітика розраховується автоматично на основі закритих замовлень-нарядів у CRM за обраний проміжок часу.</span>
            </div>

          </div>
        ) : null}

        <DialogFooter className="mt-5 pt-3 border-t border-slate-100">
          <Button type="button" onClick={onClose} className="h-9 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 w-full sm:w-auto cursor-pointer">
            Закрити вікно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}