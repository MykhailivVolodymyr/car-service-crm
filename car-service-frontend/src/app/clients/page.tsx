"use client";

import { useEffect, useState } from "react";
import { clientService } from "@/features/clients/services/clientService";
import { ClientDto } from "@/features/clients/types/Client";
import ClientActionButtons from "@/features/clients/components/ClientActionButtons";
import ClientStatsCards from "@/features/clients/components/ClientStatsCards";
import ClientsTable from "@/features/clients/components/ClientsTable";
import UpsertClientModal from "@/features/clients/components/UpsertClientModal"; 
import DeleteClientDialog from "@/features/clients/components/DeleteClientDialog"; 
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Стейт для універсальної модалки (Створення / Редагування)
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);

  // Стейт для діалогу підтвердження вилучення
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null); // ДОДАНО СТЕЙТ ПОМИЛКИ БД

  // Ефект завантаження даних та дебоунс-пошуку з бекенду
  useEffect(() => {
    const loadClientsData = async () => {
      try {
        setLoading(true);
        if (searchQuery.trim() === "") {
          const data = await clientService.getAllClients();
          setClients(data);
        } else {
          const data = await clientService.searchClients(searchQuery);
          setClients(data);
        }
      } catch (err) {
        console.error("Помилка завантаження контрагентів:", err);
      } finally {
        setLoading(false);
      }
    };

    // Затримка 400мс для дебоунсу (захист від спаму сервера)
    const delayDebounceFn = setTimeout(() => {
      loadClientsData();
    }, searchQuery ? 400 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger((p) => p + 1);

  // Функції для Створення / Редагування
  const handleOpenCreateModal = () => {
    setSelectedClient(null); 
    setIsUpsertOpen(true);
  };

  const handleOpenEditModal = (client: ClientDto) => {
    setSelectedClient(client); 
    setIsUpsertOpen(true);
  };

  // Функції для Діалогу Видалення
  const handleOpenDeleteDialog = (id: number) => {
    const target = clients.find((c) => c.id === id);
    if (target) {
      setDeleteId(id);
      setDeleteName(target.fullName);
      setDeleteError(null); // Обов'язково чистимо помилку при відкритті нового вікна
    }
  };

  // 👑 ОНОВЛЕНО: Логіка перехоплення FK помилок без використання alert
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await clientService.deleteClient(deleteId);
      
      setDeleteId(null); // Закриваємо модалку тільки якщо видалення успішне
      handleRefresh();
    } catch (err: any) {
      console.error("Помилка вилучення клієнта:", err);
      
      if (err.response?.status === 403) {
        setDeleteError("Операція відхилена: У вас немає комерційних прав для видалення контрагентів. Дія доступна лише ролі Менеджер.");
      } else {
        // Обробка помилки цілісності даних (The DELETE statement conflicted with the REFERENCE constraint)
        setDeleteError(
          `Неможливо видалити клієнта "${deleteName}", оскільки в базі даних СТО за ним закріплені транспортні засоби або активні замовлення-наряди. Спочатку вилучіть автомобілі клієнта з його гаража.`
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 w-full max-w-full relative">
      
      {/* Маленький індикатор живого пошуку */}
      {loading && searchQuery && (
        <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 z-10 animate-pulse">
          <Loader2 size={11} className="animate-spin" /> 
          <span>Пошук у БД...</span>
        </div>
      )}

      {/* КАРТКИ ШВИДКОЇ АНАЛІТИКИ БАЗИ КОНТРАГЕНТІВ */}
      <ClientStatsCards 
        clients={clients} 
        loading={loading && searchQuery.trim() === ""} 
      />

      {/* 1. ПАНЕЛЬ ВЕРХНІХ ШВИДКИХ ДІЙ */}
      <ClientActionButtons 
        totalCount={clients.length} 
        onRefresh={handleRefresh} 
        onNewClientClick={handleOpenCreateModal} 
      />

      {/* 2. ПАНЕЛЬ ЖИВОГО ПОШУКУ */}
      <div className="flex flex-row items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm select-none">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            placeholder="Пошук клієнта в базі за ПІБ або телефоном..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 text-xs pl-9 rounded-xl font-medium bg-slate-50/50 w-full"
          />
        </div>
      </div>

      {/* 3. ДИНАМІЧНА ТАБЛИЦЯ КОНТРАГЕНТІВ */}
      <ClientsTable 
        clients={clients} 
        loading={loading} 
        onEditClick={handleOpenEditModal} 
        onDeleteClick={handleOpenDeleteDialog} 
      />

      {/* 4. УНІВЕРСАЛЬНА ФОРМА UPSERT (СТВОРЕННЯ / РЕДАГУВАННЯ) */}
      <UpsertClientModal 
        isOpen={isUpsertOpen}
        client={selectedClient}
        onClose={() => {
          setIsUpsertOpen(false);
          setSelectedClient(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* 5. МОДАЛКА ПІДТВЕРДЖЕННЯ ВИЛУЧЕННЯ */}
      <DeleteClientDialog 
        isOpen={deleteId !== null}
        clientName={deleteName}
        isDeleting={isDeleting}
        error={deleteError} // ЗМІНЕНО ТУТ: тепер передаємо стейт помилки
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}