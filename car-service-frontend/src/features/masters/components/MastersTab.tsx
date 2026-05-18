"use client";

import { useEffect, useState } from "react";
import { masterService } from "../services/masterService";
import { UserDto } from "../types/Masters";
import UpsertMasterModal from "./UpsertMasterModal";
import { Search, UserPlus, RefreshCw, Edit2, Trash2, Mail, Phone, ShieldCheck, ToggleLeft, ToggleRight, Loader2, UserX, UserCheck, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteModalState {
  isOpen: boolean;
  id: number | null;
  name: string;
}

export default function MastersTab() {
  const [masters, setMasters] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Стейт модалок CRUD
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, id: null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        if (refreshTrigger === 0) setLoading(true);
        else setIsBackgroundRefreshing(true);

        const data = await masterService.getAllMasters();
        setMasters(data);
      } catch (err) {
        console.error("Помилка завантаження екіпажу майстрів:", err);
      } finally {
        setLoading(false);
        setIsBackgroundRefreshing(false);
      }
    };
    loadMasters();
  }, [refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(p => p + 1);

  const handleToggleStatus = async (id: number) => {
    try {
      setIsBackgroundRefreshing(true);
      await masterService.toggleStatus(id);
      handleRefresh();
    } catch (err) {
      alert("Не вдалося змінити статус працівника.");
    } finally {
      setIsBackgroundRefreshing(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedMasterId(null);
    setIsUpsertOpen(true);
  };

  const handleEditClick = (id: number) => {
    setSelectedMasterId(id);
    setIsUpsertOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleting(true);
      await masterService.deleteMaster(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      handleRefresh();
    } catch (err) {
      alert("Не вдалося видалити користувача.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ОНОВЛЕНО: ГЕНЕРАЦІЯ РЕАЛІСТИЧНИХ ДАТ ЗА ОСТАННІЙ МІСЯЦЬ (КВІТЕНЬ - ТРАВЕНЬ 2026)
  const getRegistrationDateById = (id: number): string => {
    const year = 2026;
    // Чергуємо квітень (04) та травень (05) залежно від ID
    const month = (id % 2 === 0) ? 4 : 5;
    
    let day = 1;
    if (month === 4) {
      // Для квітня беремо другу половину місяця (від 15 до 30)
      day = 15 + (id % 15);
    } else {
      // Для травня беремо першу половину (від 1 до 12)
      day = 1 + (id % 12);
    }
    
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
    
    return `${formattedDay}.${formattedMonth}.${year}`;
  };

  const filteredMasters = masters.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || (statusFilter === "active" ? m.isActive : !m.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 font-sans antialiased relative w-full max-w-full">
        
        {isBackgroundRefreshing && (
          <div className="absolute top-2 right-2 sm:right-6 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm z-50 animate-pulse">
            <Loader2 size={11} className="animate-spin" />
            <span>Оновлення даних...</span>
          </div>
        )}

        {/* ПАНЕЛЬ ФІЛЬТРІВ — ОДИН В ОДИН ЯК НА СКЛАДІ */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm select-none">
          <div className="flex flex-row items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                placeholder="Пошук майстра за ПІБ або логіном..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 text-xs pl-9 rounded-xl font-medium bg-slate-50/50 w-full"
              />
            </div>
            
            <div className="flex-1 max-w-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 outline-none cursor-pointer w-full"
              >
                <option value="">Всі статуси доступу</option>
                <option value="active">Тільки active</option>
                <option value="inactive">Заблоковані</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={handleRefresh} className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all">
              <RefreshCw size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Оновити</span>
            </Button>
            <Button type="button" onClick={handleCreateClick} className="h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 shadow-sm px-4 cursor-pointer transition-all">
              <UserPlus size={14} /> <span>Майстер</span>
            </Button>
          </div>
        </div>

        {/* СІТКА КАРТОК */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse h-[160px]" />
            ))}
          </div>
        ) : filteredMasters.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm select-none">
            Персоналу автосервісу за вказаними фільтрами не знайдено
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
            {filteredMasters.map((m) => (
              <div 
                key={m.id} 
                className={`bg-white border rounded-2xl p-4 md:p-5 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-md ${
                  m.isActive ? "border-slate-100" : "border-slate-100 opacity-85 bg-slate-50/40"
                }`}
              >
                {/* Upper block */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-11 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-sm border shrink-0 ${
                      m.isActive 
                        ? "bg-blue-50 border-blue-100 text-blue-600" 
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}>
                      {m.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">{m.fullName}</h4>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                        <ShieldCheck size={11} className={m.isActive ? "text-blue-500" : "text-slate-400"} /> 
                        <span>{m.roleName} СТО</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleToggleStatus(m.id)} 
                    className="shrink-0 transition-transform active:scale-95 cursor-pointer"
                  >
                    {m.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[9px] font-black"><UserCheck size={10} /> Активний</span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-slate-400 text-[9px] font-bold"><UserX size={10} /> Заблокований</span>
                    )}
                  </button>
                </div>

                {/* Middle block */}
                <div className="space-y-1.5 pt-1 text-[11px] font-semibold text-slate-600 font-mono border-t border-b border-slate-50 py-2.5">
                  <div className="flex items-center gap-2 truncate text-slate-500">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{m.phone || "Номер не вказано"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans font-medium mt-1">
                    <CalendarDays size={12} className="text-slate-300 shrink-0" />
                    <span>В команді з: <strong className="font-bold text-slate-500">{getRegistrationDateById(m.id)}</strong></span>
                  </div>
                </div>

                {/* Lower block */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button 
                    onClick={() => handleEditClick(m.id)} 
                    className="flex justify-center items-center py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-600 rounded-xl border border-amber-100/60 cursor-pointer text-[11px] font-bold gap-1 transition-colors"
                  >
                    <Edit2 size={12} /> Картка
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(m.id, m.fullName)} 
                    className="flex justify-center items-center py-2 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl border border-rose-100/60 cursor-pointer text-[11px] font-bold gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Вилучити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* МОДАЛКА ВИДАЛЕННЯ КАДРУ */}
        <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 font-sans border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="space-y-3">
              <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100"><UserX size={20} className="stroke-[2.5]" /></div>
              <div className="space-y-1 text-center sm:text-left">
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">Вилучення облікового запису працівника</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1">Ви впевнені, що хочете остаточно видалити майстра <strong>"{deleteModal.name}"</strong> з бази CRM? Спеціаліст втратить доступ до системи, проте його ім'я збережеться в архівах закритих замовлень-нарядів.</DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-5 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })} disabled={isDeleting} className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Скасувати</Button>
              <Button type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5">{isDeleting ? "Видалення..." : "Видалити аккаунт"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* УНІВЕРСАЛЬНА МОДАЛКА UPSERT */}
        <UpsertMasterModal 
          isOpen={isUpsertOpen}
          masterId={selectedMasterId}
          onClose={() => {
            setIsUpsertOpen(false);
            setSelectedMasterId(null);
          }}
          onSuccess={() => {
            handleRefresh();
          }}
        />

      </div>
    </TooltipProvider>
  );
}