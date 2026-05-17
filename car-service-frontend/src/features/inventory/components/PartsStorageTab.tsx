"use client";

import { useEffect, useState } from "react";
import { partService } from "../services/partService";
import { PartDto, PartCategoryDto, InventoryStatsDto } from "../types/Parts";
import UpsertPartModal from "./UpsertPartModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, AlertTriangle, Plus, RefreshCw, Edit2, Trash2, Minus, Loader2, DollarSign, Layers, Tag, Factory } from "lucide-react";
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
  partId: number | null;
  partName: string;
}

const LOW_STOCK_THRESHOLD = 5;

export default function PartsStorageTab() {
  const [parts, setParts] = useState<PartDto[]>([]);
  const [categories, setCategories] = useState<PartCategoryDto[]>([]);
  const [stats, setStats] = useState<InventoryStatsDto | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    partId: null,
    partName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (refreshTrigger === 0) {
          setLoading(true);
        } else {
          setIsBackgroundRefreshing(true);
        }
        
        const [partsData, catsData, statsData] = await Promise.all([
          partService.getAllParts(),
          partService.getAllCategories(),
          partService.getInventoryStats().catch(() => null)
        ]);
        
        setParts(partsData);
        setCategories(catsData);
        setStats(statsData);
      } catch (err) {
        console.error("Помилка завантаження складу та статистики:", err);
      } finally {
        setLoading(false);
        setIsBackgroundRefreshing(false);
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
        const res = await partService.searchParts(searchQuery);
        setParts(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleRefresh = () => setRefreshTrigger(p => p + 1);

  const handleQuantityAdjust = async (id: number, currentQty: number, delta: number) => {
    if (currentQty + delta < 0) return;
    try {
      setIsBackgroundRefreshing(true);
      await partService.adjustQuantity(id, delta);
      handleRefresh(); 
    } catch (err) {
      console.error(err);
      alert("Не вдалося змінити кількість товару.");
    } finally {
      setIsBackgroundRefreshing(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedPartId(null);
    setIsUpsertModalOpen(true);
  };

  const handleEditClick = (id: number) => {
    setSelectedPartId(id);
    setIsUpsertModalOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, partId: id, partName: name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.partId) return;
    try {
      setIsDeleting(true);
      await partService.deletePart(deleteModal.partId);
      setDeleteModal({ isOpen: false, partId: null, partName: "" });
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert("Не вдалося видалити товар зі складу.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredParts = parts.filter(p => 
    selectedCategory === "" || p.categoryId === Number(selectedCategory)
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 font-sans antialiased relative w-full max-w-full">
        
        {isBackgroundRefreshing && (
          <div className="absolute top-2 right-2 sm:right-6 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm z-50 animate-pulse">
            <Loader2 size={11} className="animate-spin" />
            <span>Оновлення складу...</span>
          </div>
        )}

        {/* ВЕРНУВ ІКОНКИ НА ПЛАШКИ: grid-cols-3 тримає їх в один ряд */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 select-none">
          <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between min-w-0">
            <div className="space-y-1 min-w-0">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">Номенклатура товарів</span>
              <h3 className="text-xs sm:text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">
                {loading ? <div className="h-6 bg-slate-100 rounded w-8 animate-pulse" /> : `${stats?.totalPositions ?? 0} поз.`}
              </h3>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg sm:rounded-xl shrink-0">
              <Layers size={14} className="sm:size-[18px] stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between min-w-0">
            <div className="space-y-1 min-w-0">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">Капіталізація (Собівартість)</span>
              <h3 className="text-xs sm:text-lg md:text-xl font-black text-emerald-600 tracking-tight truncate">
                {loading ? <div className="h-6 bg-slate-100 rounded w-16 animate-pulse" /> : `${// @ts-ignore
                (stats?.totalInventoryValue ?? 0).toLocaleString()} грн`}
              </h3>
            </div>
            <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg sm:rounded-xl shrink-0">
              <DollarSign size={14} className="sm:size-[18px] stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between min-w-0">
            <div className="space-y-1 min-w-0">
              <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">Критичний залишок</span>
              <h3 className={`text-xs sm:text-lg md:text-xl font-black tracking-tight truncate ${stats?.lowStockCount && stats.lowStockCount > 0 ? "text-amber-500" : "text-slate-900"}`}>
                {loading ? <div className="h-6 bg-slate-100 rounded w-8 animate-pulse" /> : `${stats?.lowStockCount ?? 0} поз.`}
              </h3>
            </div>
            <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border shrink-0 ${stats?.lowStockCount && stats.lowStockCount > 0 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
              <AlertTriangle size={14} className="sm:size-[18px] stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* ВИПРАВЛЕНО: ПАНЕЛЬ ФІЛЬТРІВ (ПОЛЯ СТАЛИ ШИРОКИМИ, ЯК НА СКРІНІ) */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm select-none">
          <div className="flex flex-row items-center gap-3 flex-1">
            {/* Пошук став широким */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                placeholder="Пошук..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 text-xs pl-9 rounded-xl font-medium bg-slate-50/50 w-full"
              />
            </div>
            
            {/* Селектор категорій став широким */}
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

          {/* Кнопки збоку */}
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={handleRefresh} className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all">
              <RefreshCw size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Оновити</span>
            </Button>
            <Button type="button" onClick={handleCreateClick} className="h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 shadow-sm px-4 cursor-pointer transition-all">
              <Plus size={14} /> <span>Додати товар</span>
            </Button>
          </div>
        </div>

        {/* ТАБЛИЦЯ СКЛАДУ (ДЕСКТОПНА) */}
        <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden select-none">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 px-5 font-bold text-slate-500">Назва запчастини / Артикул</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Категорія</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500">Виробник</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500 text-right">Закупка</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500 text-right">Ціна продажу</TableHead>
                <TableHead className="h-11 px-5 font-bold text-slate-500 text-center w-36">Залишок</TableHead>
                <TableHead className="h-11 px-5 font-bold text-center text-slate-500 w-28">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-700 text-xs font-semibold">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, c) => <TableCell key={c} className="p-4"><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                    На складі немає відповідних автозапчастин
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((p) => {
                  const isLowStock = p.quantity < LOW_STOCK_THRESHOLD;
                  return (
                    <TableRow key={p.id} className="bg-slate-50/40 hover:bg-slate-50/90 transition-colors border-b border-slate-100/60">
                      <TableCell className="p-4 pl-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-medium mt-0.5">SKU: {p.sku || "—"}</div>
                      </TableCell>
                      <TableCell className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-slate-400 shrink-0" />
                          <span className="px-2.5 py-0.5 bg-slate-100 rounded-md text-[11px] text-slate-600 font-medium">{p.categoryName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 whitespace-nowrap text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Factory size={12} className="text-slate-400 shrink-0" />
                          <span>{p.manufacturerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 whitespace-nowrap text-right text-slate-400">{p.purchasePrice.toLocaleString()} грн</TableCell>
                      <TableCell className="p-4 whitespace-nowrap text-right font-black text-slate-900">{p.sellingPrice.toLocaleString()} грн</TableCell>
                      
                      <TableCell className="p-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handleQuantityAdjust(p.id, p.quantity, -1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Minus size={11} /></button>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black min-w-[50px] text-center shadow-sm ${
                            p.quantity === 0 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : isLowStock 
                                ? "bg-amber-50 text-amber-600 border border-amber-100" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>{p.quantity} шт</span>
                          <button type="button" onClick={() => handleQuantityAdjust(p.id, p.quantity, 1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Plus size={11} /></button>
                          {isLowStock && p.quantity > 0 && <AlertTriangle size={12} className="text-amber-500 shrink-0 ml-0.5" />}
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleEditClick(p.id)} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition border border-amber-100/60 cursor-pointer">
                                <Edit2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800"><span>Редагувати</span></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleDeleteClick(p.id, p.name)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-100/60 cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md border border-slate-800"><span>Видалити</span></TooltipContent>
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

        {/* МОБІЛЬНІ КАРТКИ ЗАПЧАСТИН (ВІДОБРАЖАЮТЬСЯ ТІЛЬКИ НА МОБІЛКАХ) */}
        <div className="block md:hidden w-full space-y-2.5 select-none">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="w-full bg-white border border-slate-100 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-xl text-slate-400 font-medium text-xs italic">Запчастин не знайдено</div>
          ) : (
            filteredParts.map((p) => {
              const isLowStock = p.quantity < LOW_STOCK_THRESHOLD;
              return (
                <div key={p.id} className="w-full bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-50 pb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-slate-900 tracking-tight truncate">{p.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold block mt-0.5">SKU: {p.sku || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100 ml-2 shrink-0">
                      <button type="button" onClick={() => handleQuantityAdjust(p.id, p.quantity, -1)} className="p-1 bg-white hover:bg-slate-100 text-slate-600 rounded shadow-sm cursor-pointer"><Minus size={10} /></button>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black text-center min-w-[42px] ${p.quantity === 0 ? "bg-rose-50 text-rose-600" : isLowStock ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{p.quantity} шт</span>
                      <button type="button" onClick={() => handleQuantityAdjust(p.id, p.quantity, 1)} className="p-1 bg-white hover:bg-slate-100 text-slate-600 rounded shadow-sm cursor-pointer"><Plus size={10} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[11px] font-semibold text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Категорія</span>
                      <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-bold truncate">
                        <Tag size={11} className="text-slate-400 shrink-0" /> <span className="truncate">{p.categoryName}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Виробник</span>
                      <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-bold truncate">
                        <Factory size={11} className="text-slate-400 shrink-0" /> <span className="truncate">{p.manufacturerName}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Закупка</span>
                      <span className="text-slate-500 font-medium block mt-0.5">{p.purchasePrice.toLocaleString()} грн</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Ціна продажу</span>
                      <span className="text-blue-600 font-black block mt-0.5 text-xs">{p.sellingPrice.toLocaleString()} грн</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50/60">
                    <button onClick={() => handleEditClick(p.id)} className="flex justify-center items-center py-2 bg-amber-50 active:bg-amber-100 text-amber-600 rounded-xl border border-amber-100/60 cursor-pointer text-[11px] font-bold gap-1"><Edit2 size={12} /> Змінити</button>
                    <button onClick={() => handleDeleteClick(p.id, p.name)} className="flex justify-center items-center py-2 bg-rose-50 active:bg-rose-100 text-rose-600 rounded-xl border border-rose-100/60 cursor-pointer text-[11px] font-bold gap-1"><Trash2 size={12} /> Видалити</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* МОДАЛКА ВИДАЛЕННЯ */}
        <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 font-sans border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="space-y-3">
              <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100"><AlertTriangle size={20} className="stroke-[2.5]" /></div>
              <div className="space-y-1 text-center sm:text-left">
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">Вилучення номенклатурної позиції</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1">Ви впевнені, що хочете остаточно видалити товар <strong>"{deleteModal.partName}"</strong> з облікової бази складу СТО? Ця дія незворотна.</DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-5 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModal({ isOpen: false, partId: null, partName: "" })} disabled={isDeleting} className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Скасувати</Button>
              <Button type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5">{isDeleting ? "Видалення..." : "Видалити"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <UpsertPartModal 
          isOpen={isUpsertModalOpen}
          partId={selectedPartId}
          onClose={() => {
            setIsUpsertModalOpen(false);
            setSelectedPartId(null);
          }}
          onSuccess={() => {
            handleRefresh();
          }}
        />

      </div>
    </TooltipProvider>
  );
}