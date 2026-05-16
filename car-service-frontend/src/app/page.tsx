"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation"; 
import { mainPageService } from "@/features/mainPage/services/mainPageService";
import { DashboardStats } from "@/features/mainPage/types/DashboardStats";
import { ScheduleDto, ScheduleFilterDto, MasterUserDto, WorkPostDto } from "@/features/mainPage/types/Schedule";
import DashboardStatsCards from "@/features/mainPage/components/DashboardStatsCards";
import DashboardActionButtons from "@/features/mainPage/components/DashboardActionButtons";
import ScheduleFilters from "@/features/mainPage/components/ScheduleFilters";
import ScheduleTable from "@/features/mainPage/components/ScheduleTable";
import CreateScheduleModal from "@/features/mainPage/components/CreateScheduleModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const dateFromUrl = searchParams.get("date") || undefined; 

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  
  const [filters, setFilters] = useState<ScheduleFilterDto>({ date: dateFromUrl });
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [posts, setPosts] = useState<WorkPostDto[]>([]);
  const [masters, setMasters] = useState<MasterUserDto[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  // Синхронізуємо стейт фільтрів при зміні дати в URL (з хедера)
  useEffect(() => {
    setFilters(prev => ({ ...prev, date: dateFromUrl }));
  }, [dateFromUrl]);

  // Якщо користувач міняє дату вручну через інпут фільтрів, синхронізуємо URL
  const handleFilterChange = (newFilters: ScheduleFilterDto) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.date) {
      params.set("date", newFilters.date);
    } else {
      params.delete("date");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [loadedPosts, loadedMasters] = await Promise.all([
          mainPageService.getAllWorkPosts(true),
          mainPageService.getAllMasters(),
        ]);
        setPosts(loadedPosts);
        setMasters(loadedMasters);
      } catch (err) {
        console.error("Помилка завантаження допоміжних списків:", err);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await mainPageService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Помилка аналітики:", err);
        setError("Не вдалося завантажити дані панелі статистики");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setTableLoading(true);
        const data = await mainPageService.getFilteredSchedules(filters);
        setSchedules(data);
      } catch (err) {
        console.error("Помилка завантаження розкладу:", err);
      } finally {
        setTableLoading(false);
      }
    };
    fetchSchedules();
  }, [filters, refreshTrigger]);

  // ВИПРАВЛЕНО: тепер очищення фільтрів повністю скидає URL-параметри
  const handleClearFilters = () => {
    setFilters({});
    router.push(pathname); 
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenCreateModal = () => {
    setSelectedScheduleId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id: number) => {
    setSelectedScheduleId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScheduleId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteScheduleId) return;
    try {
      setIsDeleting(true);
      await mainPageService.deleteSchedule(deleteScheduleId);
      setDeleteScheduleId(null);
      handleRefresh();
    } catch (err) {
      console.error("Помилка видалення запису розкладу:", err);
      alert("Не вдалося видалити запис розкладу.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans">
      <DashboardStatsCards data={stats} loading={statsLoading} />
      
      <DashboardActionButtons onNewScheduleClick={handleOpenCreateModal} />
      
      <ScheduleFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} // Використовуємо нову функцію
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
        totalCount={schedules.length}
        posts={posts}
        masters={masters}
      />

      <ScheduleTable 
        schedules={schedules} 
        loading={tableLoading} 
        onEditClick={handleOpenEditModal}
        onDeleteClick={(id) => setDeleteScheduleId(id)} 
      />

      <CreateScheduleModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleRefresh}
        posts={posts}
        masters={masters}
        scheduleId={selectedScheduleId}
      />

      {/* Модалка видалення */}
      <Dialog open={deleteScheduleId !== null} onOpenChange={(open) => !open && setDeleteScheduleId(null)}>
        <DialogContent className="max-w-[440px] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 font-sans antialiased">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
              <AlertTriangle size={28} />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Видалення запису з розкладу
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium leading-relaxed px-2">
              Ви впевнені, що хочете видалити цей запис? Скасувати цю дію буде неможливо, часовий слот звільниться для інших клієнтів СТО.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 grid grid-cols-2 gap-3 w-full sm:space-x-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteScheduleId(null)}
              disabled={isDeleting}
              className="h-11 rounded-xl font-bold border-slate-200 text-slate-600 text-sm cursor-pointer hover:bg-slate-50 transition"
            >
              Скасувати
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-11 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm cursor-pointer shadow-md transition disabled:opacity-50"
            >
              {isDeleting ? "Видалення..." : "Так, видалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium shadow-sm">
          {error}. Перевірте з'єднання з .NET API.
        </div>
      )}
    </div>
  );
}