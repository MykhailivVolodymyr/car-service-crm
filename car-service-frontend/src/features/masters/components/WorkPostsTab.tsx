"use client";

import { useEffect, useState } from "react";
import { masterService } from "../services/masterService";
import { WorkPostDto } from "../types/WorkPosts";
import UpsertWorkPostModal from "./UpsertWorkPostModal";
import { Search, Plus, RefreshCw, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, LayoutGrid, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteModalState {
  isOpen: boolean;
  id: number | null;
  name: string;
}

export default function WorkPostsTab() {
  const [posts, setPosts] = useState<WorkPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Модалки
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, id: null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        if (refreshTrigger === 0) setLoading(true);
        else setIsBackgroundRefreshing(true);

        const data = await masterService.getAllWorkPosts();
        setPosts(data);
      } catch (err) {
        console.error("Помилка завантаження постів:", err);
      } finally {
        setLoading(false);
        setIsBackgroundRefreshing(false);
      }
    };
    loadPosts();
  }, [refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(p => p + 1);

  // PATCH перемикач статусу поста СТО
  const handleToggleStatus = async (id: number) => {
    try {
      setIsBackgroundRefreshing(true);
      await masterService.toggleWorkPostStatus(id);
      handleRefresh();
    } catch (err) {
      alert("Не вдалося змінити статус робочого поста.");
    } finally {
      setIsBackgroundRefreshing(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedPostId(null);
    setIsUpsertOpen(true);
  };

  const handleEditClick = (id: number) => {
    setSelectedPostId(id);
    setIsUpsertOpen(true);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleting(true);
      await masterService.deleteWorkPost(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
      handleRefresh();
    } catch (err) {
      alert("Не вдалося вилучити робочий пост.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || (statusFilter === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4 font-sans antialiased relative w-full max-w-full">

        {isBackgroundRefreshing && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 z-50 animate-pulse">
            <Loader2 size={11} className="animate-spin" />
            <span>Оновлення даних...</span>
          </div>
        )}

        {/* ФІЛЬТРИ */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm select-none">
          <div className="flex flex-row items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                placeholder="Пошук робочого боксу чи підйомника за назвою..."
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
                <option value="">Всі статуси постів</option>
                <option value="active">Тільки активні</option>
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
              <Plus size={14} /> <span>Пост</span>
            </Button>
          </div>
        </div>

        {/* ПЛИТКА КАРТОК РОБОЧИХ ПОСТІВ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 h-36 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm select-none">
            Жодного робочого поста за вказаними фільтрами не знайдено
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            {filteredPosts.map((p) => (
              <div 
                key={p.id} 
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200 ${
                  p.isActive ? "border-slate-100" : "border-slate-100 opacity-85 bg-slate-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                      p.isActive ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}>
                      <LayoutGrid size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 tracking-tight truncate">{p.name}</h4>
                      <span className="text-[9px] font-medium text-slate-400 block mt-0.5">ID поста: {p.id}</span>
                    </div>
                  </div>

                  <button type="button" onClick={() => handleToggleStatus(p.id)} className="cursor-pointer shrink-0 transition-transform active:scale-95">
                    {p.isActive ? (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[9px] font-black"><CheckCircle2 size={10} /> Активний</span>
                    ) : (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-slate-400 text-[9px] font-bold"><XCircle size={10} /> Заблокований</span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50/80">
                  <button onClick={() => handleEditClick(p.id)} className="flex justify-center items-center py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-600 rounded-xl border border-amber-100/60 cursor-pointer text-[11px] font-bold gap-1 transition-colors"><Edit2 size={11} /> Змінити</button>
                  <button onClick={() => handleDeleteClick(p.id, p.name)} className="flex justify-center items-center py-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl border border-rose-100/60 cursor-pointer text-[11px] font-bold gap-1 transition-colors"><Trash2 size={11} /> Вилучити</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* МОДАЛКА ВИДАЛЕННЯ ПОСТА */}
        <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 font-sans border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="space-y-3">
              <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100"><Trash2 size={18} className="stroke-[2.5]" /></div>
              <div className="space-y-1 text-center sm:text-left">
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">Вилучення робочого поста</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1">Ви впевнені, що хочете остаточно видалити <strong>"{deleteModal.name}"</strong> з бази СТО? Якщо цей бокс прив'язаний до активних замовлень-нарядів, сервер поверне помилку цілісності даних.</DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-5 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })} disabled={isDeleting} className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Скасувати</Button>
              <Button type="button" disabled={isDeleting} onClick={handleConfirmDelete} className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5">{isDeleting ? "Вилучення..." : "Видалити пост"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* УНІВЕРСАЛЬНА МОДАЛКА СТВОРЕННЯ/РЕДАГУВАННЯ */}
        <UpsertWorkPostModal 
          isOpen={isUpsertOpen}
          postId={selectedPostId}
          onClose={() => {
            setIsUpsertOpen(false);
            setSelectedPostId(null);
          }}
          onSuccess={handleRefresh}
        />

      </div>
    </TooltipProvider>
  );
}