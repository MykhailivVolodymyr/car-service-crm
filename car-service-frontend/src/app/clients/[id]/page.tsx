"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientService } from "@/features/clients/services/clientService";
import { ClientDto } from "@/features/clients/types/Client";
import { VehicleDto, ClientScheduleDto, ClientOrderDto } from "@/features/clients/types/ClientDetails";

import ClientVehiclesTab from "@/features/clients/components/ClientVehiclesTab";
import ClientOrdersTab from "@/features/clients/components/ClientOrdersTab";
import ClientVisitsTab from "@/features/clients/components/ClientVisitsTab";
import UpsertVehicleModal from "@/features/clients/components/UpsertVehicleModal"; 
import DeleteClientDialog from "@/features/clients/components/DeleteClientDialog"; 

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, ArrowLeft, Loader2, Car, ClipboardList, CalendarDays, Clock, CalendarCheck } from "lucide-react";

export default function ClientDetailsHubPage() {
  const { id } = useParams();
  const router = useRouter();
  const clientId = Number(id);

  const [client, setClient] = useState<ClientDto | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [schedules, setSchedules] = useState<ClientScheduleDto[]>([]);
  const [orders, setOrders] = useState<ClientOrderDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // КЕРУВАННЯ МОДАЛКАМИ ГАРАЖА
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null);

  // Стейт для модалки підтвердження видалення авто
  const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
  const [deleteVehicleName, setDeleteVehicleName] = useState("");
  const [isVehicleDeleting, setIsVehicleDeleting] = useState(false);
  const [deleteVehicleError, setDeleteVehicleError] = useState<string | null>(null);

  const handleRefresh = () => setRefreshTrigger((p) => p + 1);

  useEffect(() => {
    if (!clientId) return;

    const fetchAllClientData = async () => {
      try {
        setLoading(refreshTrigger === 0); 
        const [profile, cars, visits, jobs] = await Promise.all([
          clientService.getById(clientId),
          clientService.getVehiclesByClient(clientId),
          clientService.getSchedulesByClient(clientId),
          clientService.getOrdersByClient(clientId),
        ]);

        setClient(profile);
        setVehicles(cars);
        setSchedules(visits);
        setOrders(jobs);
      } catch (err) {
        console.error("Помилка aggregation даних профілю клієнта 360:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllClientData();
  }, [clientId, refreshTrigger]);

  // ФУНКЦІЇ КЕРУВАННЯ АВТОМОБІЛЯМИ
  const handleOpenAddVehicle = () => {
    setSelectedVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleOpenDeleteVehicle = (id: number) => {
    const target = vehicles.find((v) => v.id === id);
    if (target) {
      setDeleteVehicleId(id);
      setDeleteVehicleName(`${target.brandName} ${target.modelName} (${target.licensePlate})`);
      setDeleteVehicleError(null);
    }
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!deleteVehicleId) return;
    try {
      setIsVehicleDeleting(true);
      setDeleteVehicleError(null);
      await clientService.deleteVehicle(deleteVehicleId);
      setDeleteVehicleId(null);
      handleRefresh(); 
    } catch (err: any) {
      console.error("Помилка вилучення автомобіля з системи:", err);
      setDeleteVehicleError(
        "Неможливо вилучити цей автомобіль з гаража, оскільки за ним на СТО закріплені active замовлення-наряди або історія ремонтів."
      );
    } finally {
      setIsVehicleDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 text-slate-400 font-medium font-sans">
        <Loader2 className="animate-spin text-blue-600 size-6" />
        <span className="text-xs">Генерація картки контрагента та аналітики візитів...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center text-slate-500 font-medium font-sans">
        Контрагента не знайдено в базі системи AutoServiceCRM.
      </div>
    );
  }

  // РОЗРАХУНОК ДИНАМІЧНИХ МЕТРИК ВІЗИТІВ
  let firstVisitDisplay = "—";
  let lastVisitDisplay = "—";
  const totalVisitsCount = schedules.length;

  if (totalVisitsCount > 0) {
    const sortedVisits = [...schedules].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const firstVisitDate = sortedVisits[0].startTime.split("T")[0];
    const lastVisitDate = sortedVisits[sortedVisits.length - 1].startTime.split("T")[0];

    firstVisitDisplay = new Date(firstVisitDate).toLocaleDateString("uk-UA");
    lastVisitDisplay = new Date(lastVisitDate).toLocaleDateString("uk-UA");
  }

  // Розрахунок фінансового обороту
  const totalLifetimeSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Форматування номеру для WhatsApp веб-протоколу
  const cleanPhoneForWhatsApp = client.phone.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanPhoneForWhatsApp}`;

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 w-full max-w-full relative">
      
      {/* Кнопка навігації назад */}
      <div className="flex items-center justify-between select-none">
        <Button 
          variant="outline" 
          onClick={() => router.push("/clients")}
          className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1 px-3 cursor-pointer"
        >
          <ArrowLeft size={13} /> <span>До списку клієнтів</span>
        </Button>
        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-bold">
          Аналітичний хаб контрагента 360°
        </span>
      </div>

      {/* 👑 ГОЛОВНА ПАНЕЛЬ КЛІЄНТА З ПОКРАЩЕНИМ БЛОКОМ UX-КНОПОК */}
      <div className="bg-white border border-slate-100 border-l-4 border-l-blue-600 rounded-2xl p-5 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 select-none">
        
        {/* ЛІВИЙ БЛОК: Особисті дані (чисті й акуратні) */}
        <div className="flex items-center gap-3.5 min-w-0 shrink-0">
          <div className="size-11 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/60 flex items-center justify-center shrink-0">
            <User size={20} className="text-slate-500 stroke-[2.2]" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate" title={client.fullName}>
              {client.fullName}
            </h1>
            <div className="flex flex-col space-y-1 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-800 tabular-nums">
                <Phone size={12} className="text-slate-400" /> {client.phone}
              </span>
              {client.email ? (
                <span className="flex items-center gap-1.5 font-medium text-slate-400 truncate">
                  <Mail size={12} className="text-slate-300" /> {client.email}
                </span>
              ) : (
                <span className="text-slate-300 italic font-normal">email не вказано</span>
              )}
            </div>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНИЙ БЛОК: Хронологія візитів та аналітика фінансів */}
        <div className="grid grid-cols-3 gap-4 border-t xl:border-t-0 border-b xl:border-b-0 border-slate-50 py-3 xl:py-0 text-[11px] font-semibold text-slate-500 flex-1 justify-items-start xl:justify-items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Перший візит</span>
            <div className="flex items-center gap-1.5 text-slate-700 font-bold tabular-nums">
              <Clock size={13} className="text-slate-400" /> {firstVisitDisplay}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Останній візит</span>
            <div className="flex items-center gap-1.5 text-slate-700 font-bold tabular-nums">
              <CalendarCheck size={13} className="text-slate-400" /> {lastVisitDisplay}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Загальний Оборот</span>
            <div className="text-xs font-black text-slate-900 tracking-tight tabular-nums">
              {totalLifetimeSpent.toLocaleString()} ₴
            </div>
          </div>
        </div>

        {/* ПРАВИЙ БЛОК: 👑 ВЕЛИКИЙ РЯД КНОПОК ШВИДКОЇ КОМУНІКАЦІЇ (ЯК НА ГОЛОВНІЙ) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Кнопка Telegram */}
          <a 
            href={`https://t.me/${client.phone.replace(/[^0-9+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-sky-500/10 cursor-pointer transition-all"
            title="Написати клієнту в Telegram"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>Telegram</span>
          </a>

          {/* Кнопка WhatsApp */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer transition-all"
            title="Написати клієнту в WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.176.001 6.165 1.236 8.413 3.484 2.248 2.248 3.481 5.236 3.482 8.415-.004 6.599-5.342 11.947-11.894 11.947-1.997-.001-3.957-.502-5.692-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.755 1.451 5.334 0 9.673-4.34 9.676-9.678.002-2.586-1.003-5.015-2.831-6.844-1.828-1.828-4.253-2.831-6.837-2.832-5.337 0-9.676 4.339-9.679 9.678-.001 1.706.469 3.376 1.358 4.815l-.991 3.616 3.709-.973zm10.165-6.818c-.29-.145-1.72-.849-1.986-.945-.266-.096-.46-.145-.654.145-.193.291-.749.945-.919 1.139-.17.194-.341.218-.631.073-.29-.145-1.229-.453-2.34-1.444-.865-.772-1.449-1.725-1.619-2.016-.17-.291-.018-.447.127-.592.131-.13.291-.34.436-.509.145-.17.193-.291.29-.485.097-.194.049-.364-.024-.509-.073-.145-.654-1.577-.896-2.159-.236-.567-.475-.49-.654-.499-.169-.008-.363-.01-.557-.01-.194 0-.508.073-.774.364-.266.291-1.016.994-1.016 2.425 0 1.431 1.041 2.814 1.186 3.008.145.194 2.05 3.13 4.965 4.386.694.299 1.236.478 1.658.613.698.222 1.334.191 1.837.116.56-.083 1.72-.703 1.962-1.383.243-.679.243-1.261.17-1.383-.073-.122-.266-.194-.557-.339z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          {/* Кнопка Email листа */}
          <a 
            href={client.email ? `mailto:${client.email}` : "#"}
            className={`h-9 px-3.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              client.email 
                ? "bg-slate-700 hover:bg-slate-800 text-white shadow-sm shadow-slate-700/10 cursor-pointer" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
            }`}
            title={client.email ? "Надіслати Email лист" : "Електронну пошту не вказано"}
          >
            <Mail size={13} />
            <span>Написати</span>
          </a>

          {/* Розділювач між кнопками та лічильником */}
          <div className="hidden sm:block h-6 w-[1px] bg-slate-100 mx-2" />

          {/* Лічильник візитів */}
          <div className="text-center px-4">
            <span className="text-2xl font-black text-blue-600 block tabular-nums leading-none">{totalVisitsCount}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-1">Всього візитів</span>
          </div>

        </div>

      </div>

      {/* ВМЕСТ ТАБІВ З ДЕТАЛЬНИМИ ТАБЛИЦЯМИ */}
      <div className="w-full pt-2">
        <Tabs defaultValue="garage" className="w-full space-y-4">
          
          <TabsList className="bg-slate-100 border border-slate-200/40 p-1 rounded-xl h-11 w-full max-w-md grid grid-cols-3 text-xs font-bold font-sans text-slate-500 shadow-sm">
            <TabsTrigger value="garage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-center gap-1 py-1.5 cursor-pointer transition-all">
              <Car size={13} /> <span>Гараж ({vehicles.length})</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-center gap-1 py-1.5 cursor-pointer transition-all">
              <ClipboardList size={13} /> <span>Ремонти ({orders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center justify-center gap-1 py-1.5 cursor-pointer transition-all">
              <CalendarDays size={13} /> <span>Візити ({schedules.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="garage" className="mt-0 focus-visible:outline-none">
            <ClientVehiclesTab 
              vehicles={vehicles} 
              onAddVehicleClick={handleOpenAddVehicle}
              onEditVehicleClick={handleOpenEditVehicle}
              onDeleteVehicleClick={handleOpenDeleteVehicle}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
            <ClientOrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="visits" className="mt-0 focus-visible:outline-none">
            <ClientVisitsTab schedules={schedules} />
          </TabsContent>

        </Tabs>
      </div>

      {/* МОДАЛКА UPSERT ДЛЯ АВТОМОБІЛЯ */}
      <UpsertVehicleModal 
        isOpen={isVehicleModalOpen}
        vehicle={selectedVehicle}
        client={client}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАННЯ АВТО */}
      <DeleteClientDialog 
        isOpen={deleteVehicleId !== null}
        clientName={deleteVehicleName}
        isDeleting={isVehicleDeleting}
        error={deleteVehicleError}
        onClose={() => setDeleteVehicleId(null)}
        onConfirm={handleConfirmDeleteVehicle}
      />

    </div>
  );
}