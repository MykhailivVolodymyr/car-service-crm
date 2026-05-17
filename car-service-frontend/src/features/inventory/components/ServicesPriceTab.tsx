"use client";

import { useEffect, useState } from "react";
import { servicePriceListService, ServiceDto } from "../services/servicePriceListService";
import { ServiceCategoryDto } from "../types/Services";
import UpsertServiceModal from "./UpsertServiceModal"; // ДОДАНО
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Wrench, Plus, RefreshCw, Layers, Edit2, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteModalState {
  isOpen: boolean;
  serviceId: number | null;
  serviceName: string;
}

export default function ServicesPriceTab() {
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ДОДАНО: Стейт для модалки Створення / Редагування послуг
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    serviceId: null,
    serviceName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [catsData, servicesData] = await Promise.all([
          servicePriceListService.getAllCategories(),
          servicePriceListService.getGlobalServices().catch(() => [])
        ]);
        setCategories(catsData);
        setServices(servicesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (refreshTrigger > 0) setRefreshTrigger(prev => prev + 1);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await servicePriceListService.searchGlobalServices(searchQuery);
        setServices(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleRefresh = () => setRefreshTrigger(p => p + 1);

  // ДОДАНО: Функції виклику модалки прайсу
  const handleCreateClick = () => {
    setSelectedServiceId(null);
    setIsUpsertModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    setSelectedServiceId(id);
    setIsUpsertModalOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, serviceId: id, serviceName: name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.serviceId) return;
    try {
      setIsDeleting(true);
      await servicePriceListService.deleteService(deleteModal.serviceId);
      setDeleteModal({ isOpen: false, serviceId: null, serviceName: "" });
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити послугу з прайсу.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter(s => 
    selectedCategory === "" || s.categoryId === Number(selectedCategory)
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 font-sans antialiased relative w-full max-w-full">
        
        {/* ФІЛЬТРИ */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm select-none">
          <div className="flex flex-row items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                placeholder="Пошук послуг"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 text-xs pl-9 rounded-xl font-medium bg-slate-50/50 w-full"
              />
            </div>
            
            <div className="flex-1 max-w-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 outline-none cursor-pointer w-full"
              >
                <option value="">Всі категорії</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={handleRefresh} className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all">
              <RefreshCw size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Оновити</span>
            </Button>
            {/* ОНОВЛЕНО: Виклик функції створення послуги */}
            <Button type="button" onClick={handleCreateClick} className="h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 shadow-sm px-4 cursor-pointer transition-all">
              <Plus size={14} /> <span>Додати послугу</span>
            </Button>
          </div>
        </div>

        {/* 1. ДЕСКТОПНА ТАБЛИЦЯ АВТОРОБІТ */}
        <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden select-none">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 px-5 font-bold text-slate-500">Назва технологічної операції</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Категорія послуги</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500 text-right pr-10">Базова вартість</TableHead>
                <TableHead className="h-11 px-5 font-bold text-center text-slate-500 w-28">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-700 text-xs font-semibold">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: 4 }).map((_, c) => <TableCell key={c} className="p-4"><div className="h-4 bg-slate-100 rounded w-20" /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredServices.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400 font-medium text-sm">Жодних послуг або прайс-листів не знайдено</TableCell></TableRow>
              ) : (
                filteredServices.map((s) => (
                  <TableRow key={s.id} className="bg-slate-50/40 hover:bg-slate-50/90 transition-colors border-b border-slate-100/60">
                    <TableCell className="p-4 pl-5 font-bold text-slate-900 flex items-center gap-2">
                      <Layers size={13} className="text-slate-300 shrink-0" />
                      <div>
                        <div>{s.name}</div>
                        {s.description && <div className="text-[10px] text-slate-400 font-normal normal-case mt-0.5 max-w-md truncate">{s.description}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} className="text-slate-400 shrink-0" />
                        <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-md text-[10px] text-blue-600 font-black tracking-wide uppercase shadow-sm">{s.categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 whitespace-nowrap text-right font-black text-slate-900 text-sm pr-10">{s.defaultPrice.toLocaleString()} грн</TableCell>
                    
                    <TableCell className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* ОНОВЛЕНО: Виклик функції редагування */}
                            <button onClick={() => handleEditClick(s.id)} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition border border-amber-100/60 cursor-pointer">
                              <Edit2 size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800"><span>Редагувати послугу</span></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleDeleteClick(s.id, s.name)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-100/60 cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800"><span>Видалити з прайсу</span></TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 2. МОБІЛЬНІ КАРТКИ ПОСЛУГ */}
        <div className="block md:hidden w-full space-y-2.5 select-none">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-slate-100 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-xl text-slate-400 font-medium text-xs italic">Послуг не знайдено</div>
          ) : (
            filteredServices.map((s) => (
              <div key={s.id} className="w-full bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-50 pb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight break-words pr-2">{s.name}</h4>
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-slate-600">
                      <Tag size={11} className="text-slate-400" />
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase">{s.categoryName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Вартість</span>
                    <span className="text-emerald-600 font-black text-sm block mt-0.5">{s.defaultPrice.toLocaleString()} ₴</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* ОНОВЛЕНО: Виклик функції редагування для мобілок */}
                  <button onClick={() => handleEditClick(s.id)} className="flex justify-center items-center py-2 bg-amber-50 active:bg-amber-100 text-amber-600 rounded-xl border border-amber-100/60 cursor-pointer text-[11px] font-bold gap-1"><Edit2 size={12} /> Змінити</button>
                  <button onClick={() => handleDeleteClick(s.id, s.name)} className="flex justify-center items-center py-2 bg-rose-50 active:bg-rose-100 text-rose-600 rounded-xl border border-rose-100/60 cursor-pointer text-[11px] font-bold gap-1"><Trash2 size={12} /> Видалити</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* МОДАЛКА ВИДАЛЕННЯ ПОСЛУГИ */}
        <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 font-sans border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="space-y-3">
              <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100"><Wrench size={20} className="stroke-[2.5]" /></div>
              <div className="space-y-1 text-center sm:text-left">
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">Вилучення послуги з прайсу</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1">Ви впевнені, що хочете остаточно видалити тех. роботу <strong>"{deleteModal.serviceName}"</strong> з базового прейскуранту СТО? Всі закриті наряди збережуть свої ціни, але створювати нові записи з цією послугою буде неможливо.</DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-5 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModal({ isOpen: false, serviceId: null, serviceName: "" })} disabled={isDeleting} className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Скасувати</Button>
              <Button type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5">{isDeleting ? "Вилучення..." : "Видалити з прайсу"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ДОДАНО: УНІВЕРСАЛЬНА МОДАЛКА СТВОРЕННЯ/РЕДАГУВАННЯ ПОСЛУГ */}
        <UpsertServiceModal 
          isOpen={isUpsertModalOpen}
          serviceId={selectedServiceId}
          onClose={() => {
            setIsUpsertModalOpen(false);
            setSelectedServiceId(null);
          }}
          onSuccess={() => {
            handleRefresh();
          }}
        />

      </div>
    </TooltipProvider>
  );
}