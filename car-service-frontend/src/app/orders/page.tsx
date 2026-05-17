"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/features/orders/services/orderService";
import { OrderDto, OrderStats } from "@/features/orders/types/Order";
import OrderStatsCards from "@/features/orders/components/OrderStatsCards";
import OrderActionButtons from "@/features/orders/components/OrderActionButtons";
import OrdersTable from "@/features/orders/components/OrdersTable";
import CreateOrderModal from "@/features/orders/components/CreateOrderModal";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Стейт для відкриття модалки
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  // ОНОВЛЕНО: Стейт для збереження ID замовлення, яке ми хочемо редагувати
  const [selectedEditOrderId, setSelectedEditOrderId] = useState<number | null>(null);

  const [stats, setStats] = useState<OrderStats>({
    newCount: 0,
    inProgressCount: 0,
    waitingPartsCount: 0,
    readyCount: 0,
    totalCount: 0,
  });

  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getAllOrders();
        setOrders(data);

        const newCount = data.filter((o) => o.statusId === 1).length;
        const inProgressCount = data.filter((o) => o.statusId === 2).length;
        const waitingPartsCount = data.filter((o) => o.statusId === 3).length;
        const readyCount = data.filter((o) => o.statusId === 4).length;

        setStats({
          newCount,
          inProgressCount,
          waitingPartsCount,
          readyCount,
          totalCount: data.length,
        });
      } catch (err: any) {
        console.error("Помилка завантаження замовлень:", err);
        setError("Не вдалося завантажити список замовлень-нарядів.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // ОБРОБНИК НАТИСКАННЯ НА РЕДАГУВАННЯ (Передаємо в таблицю)
  const handleEditClick = (id: number) => {
    setSelectedEditOrderId(id); // Фіксуємо ID замовлення для PUT запиту
    setIsCreateModalOpen(true); // Відкриваємо ту саму модалку
  };

  // ОБРОБНИК ДЛЯ СТВОРЕННЯ НОВОГО ЗАМОВЛЕННЯ
  const handleNewOrderClick = () => {
    setSelectedEditOrderId(null); // Строго скидаємо ID, щоб модалка працювала в режимі POST
    setIsCreateModalOpen(true);
  };

  const handlePrintInvoice = async (id: number) => {
    try {
      const pdfBlob = await orderService.printOrderInvoice(id);
      const fileURL = window.URL.createObjectURL(pdfBlob);
      const fileLink = document.createElement("a");
      
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `Order_No_${id}_Invoice.pdf`);
      document.body.appendChild(fileLink);
      
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Помилка генерації PDF-рахунку:", err);
      alert("Не вдалося завантажити або роздрукувати PDF-рахунок для цього замовлення.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrderId) return;
    try {
      setIsDeleting(true);
      await orderService.deleteOrder(deleteOrderId);
      setDeleteOrderId(null);
      handleRefresh();
    } catch (err: any) {
      console.error("Помилка видалення замовлення:", err);
      if (err.response && err.response.status === 403) {
        alert("У вас немає прав для видалення. Ця дія доступна тільки для ролі Менеджер.");
      } else {
        alert("Не вдалося видалити замовлення-наряд.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600">
      
      {/* КАРТКИ СТАТИСТИКИ */}
      <OrderStatsCards stats={stats} loading={loading} />

      {/* ШВИДКІ ДІЇ (Оновлено: викликаємо функцію скидання ID) */}
      <OrderActionButtons 
        onNewOrderClick={handleNewOrderClick} 
        onClientSearchClick={() => alert("Перехід до бази контрагентів СТО")} 
        onExportClick={() => alert("Експорт поточної таблиці замовлень в Excel")} 
      />

      {/* ШАПКА ТАБЛИЦІ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl shadow-sm px-5 py-3.5 select-none">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Замовлення-наряди СТО</h2>
          <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full min-w-[22px] text-center shadow-sm">
            {stats.totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="h-10 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:shadow-sm text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer transition-all duration-200"
          >
            <RefreshCw size={14} className="text-slate-400" />
            <span>Оновити</span>
          </Button>
        </div>
      </div>

      {/* ГОЛОВНА ТАБЛИЦЯ ЗАМОВЛЕНЬ (Оновлено: замість alert передаємо handleEditClick) */}
      <OrdersTable 
        orders={orders}
        loading={loading}
        onEditClick={handleEditClick}
        onPrintClick={handlePrintInvoice}
        onDeleteClick={(id) => setDeleteOrderId(id)}
      />

      {/* ОНОВЛЕНО: МОДАЛКА ФОРМИ (Створення / Редагування) */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen}
        orderId={selectedEditOrderId} // Передаємо поточний ID (або null)
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedEditOrderId(null); // Завжди зачищаємо ID при закритті вікна
        }}
        onSuccess={() => {
          handleRefresh(); // Оновлюємо інтерфейс СТО після успішного PUT запиту
        }}
      />

      {/* МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
      <Dialog open={deleteOrderId !== null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <DialogContent className="max-w-[440px] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-6">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
              <AlertTriangle size={28} />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Видалення замовлення-наряду
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium leading-relaxed px-2">
              Ви впевнені, що хочете видалити замовлення-наряд №{deleteOrderId}? Ця дія безповоротно очистить фінансову історію ремонту. Видалення доступне тільки для користувачів з роллю Менеджер.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 grid grid-cols-2 gap-3 w-full sm:space-x-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteOrderId(null)}
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
          {error} Перевірте, чи запущений твій сервер ASP.NET Core Web API.
        </div>
      )}
    </div>
  );
}