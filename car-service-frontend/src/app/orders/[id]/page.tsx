"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/features/orders/services/orderService";
import { 
  OrderDto, OrderServiceDto, OrderPartDto, 
  AddOrderServiceDto, AddOrderPartDto, ServiceDto, PartDto 
} from "@/features/orders/types/Order";
import { 
  ArrowLeft, RefreshCw, Loader2, Wrench, Package, 
  User, Car, Phone, FileText, Trash2, Plus, Minus, Milestone, Clipboard, AlertTriangle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface DeleteModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => Promise<void>;
}

// Довідник статусів СТО відповідно до твоїх статус ID
const AVAILABLE_STATUSES = [
  { id: 1, name: "Новий" },
  { id: 2, name: "В роботі" },
  { id: 3, name: "Очікує запчастин" },
  { id: 4, name: "Готово" },
  { id: 5, name: "Закрито" }
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [services, setServices] = useState<OrderServiceDto[]>([]);
  const [parts, setParts] = useState<OrderPartDto[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Стейт для відстеження процесу зміни статусу в API
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    onConfirm: async () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // ЖИВИЙ ПОШУК ПОСЛУГ
  const [serviceQuery, setServiceQuery] = useState("");
  const [searchedGlobalServices, setSearchedGlobalServices] = useState<ServiceDto[]>([]);
  const [isServiceSearching, setIsServiceSearching] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [servicePrice, setServicePrice] = useState("");

  // ЖИВИЙ ПОШУК ЗАПЧАСТИН
  const [partQuery, setPartQuery] = useState("");
  const [searchedGlobalParts, setSearchedGlobalParts] = useState<PartDto[]>([]);
  const [isPartSearching, setIsPartSearching] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [partPrice, setPartPrice] = useState("");
  const [partQuantity, setPartQuantity] = useState("1");

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!orderId) return;
      try {
        if (refreshTrigger === 0) {
          setInitialLoading(true);
        } else {
          setIsBackgroundRefreshing(true);
        }

        const [orderData, servicesData, partsData] = await Promise.all([
          orderService.getOrderById(orderId),
          orderService.getServicesByOrderId(orderId),
          orderService.getPartsByOrderId(orderId)
        ]);
        setOrder(orderData);
        setServices(servicesData);
        setParts(partsData);
      } catch (err) {
        console.error("Помилка завантаження деталей ремонту:", err);
      } finally {
        setInitialLoading(false);
        setIsBackgroundRefreshing(false);
      }
    };
    fetchAllDetails();
  }, [orderId, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // ОНОВЛЕНО: Функція зміни статусу замовлення через Patch метод API
  const handleStatusChange = async (newStatusId: number) => {
    if (!orderId) return;
    try {
      setIsStatusUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatusId);
      handleRefresh();
    } catch (err) {
      console.error("Не вдалося оновити статус замовлення:", err);
      alert("Помилка при зміні статусу ремонту.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // ДЕБАУНС ДЛЯ ПОШУКУ ПОСЛУГ
  useEffect(() => {
    if (serviceQuery.trim().length < 1 || serviceQuery === services.find(s => s.serviceName === serviceQuery)?.serviceName) {
      setSearchedGlobalServices([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsServiceSearching(true);
        const res = await orderService.searchGlobalServices(serviceQuery);
        setSearchedGlobalServices(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsServiceSearching(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [serviceQuery]);

  // ДЕБАУНС ДЛЯ ПОШУКУ ЗАПЧАСТИН
  useEffect(() => {
    if (partQuery.trim().length < 1) {
      setSearchedGlobalParts([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsPartSearching(true);
        const res = await orderService.searchGlobalParts(partQuery);
        setSearchedGlobalParts(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsPartSearching(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [partQuery]);

  const handleAddServiceSubmit = async () => {
    if (!serviceQuery || !servicePrice) return;
    try {
      const dto: AddOrderServiceDto = {
        orderId,
        serviceId: selectedServiceId, 
        customName: serviceQuery,      
        price: Number(servicePrice),
        quantity: 1
      };
      await orderService.addServiceToOrder(dto);
      setServiceQuery("");
      setServicePrice("");
      setSelectedServiceId(null);
      handleRefresh();
    } catch (err) {
      alert("Не вдалося додати послугу.");
    }
  };

  const handleServiceQuantityChange = async (id: number, currentQty: number, delta: number, serviceName: string) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      setDeleteModal({
        isOpen: true,
        title: "Видалення автороботи",
        description: `Ви зменшили кількість до нуля. Бажаєте повністю видалити послугу "${serviceName}" з цього замовлення-наряду?`,
        confirmText: "Так, видалити",
        onConfirm: async () => {
          await orderService.deleteServiceLine(id);
          handleRefresh();
        }
      });
      return;
    }
    try {
      await orderService.setServiceQuantity(id, newQty);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: number, serviceName: string) => {
    setDeleteModal({
      isOpen: true,
      title: "Видалення автороботи",
      description: `Ви впевнені, що хочете остаточно прибрати послугу "${serviceName}" з калькуляції ремонту?`,
      confirmText: "Видалити роботу",
      onConfirm: async () => {
        await orderService.deleteServiceLine(id);
        handleRefresh();
      }
    });
  };

  const handleAddPartSubmit = async () => {
    if (!partQuery || !partPrice) return;
    try {
      const dto: AddOrderPartDto = {
        orderId,
        partId: selectedPartId, 
        partName: partQuery,
        price: Number(partPrice),
        quantity: Number(partQuantity || 1)
      };
      await orderService.addPartToOrder(dto);
      setPartQuery("");
      setPartPrice("");
      setPartQuantity("1");
      setSelectedPartId(null);
      handleRefresh();
    } catch (err) {
      alert("Не вдалося додати запчастину.");
    }
  };

  const handlePartQuantityChange = async (part: OrderPartDto, delta: number) => {
    if (delta === 1) {
      try {
        const dto: AddOrderPartDto = {
          orderId: part.orderId,
          partId: part.partId,
          partName: part.partName,
          price: part.price,
          quantity: 1
        };
        await orderService.addPartToOrder(dto);
        handleRefresh();
      } catch (err) {
        console.error(err);
      }
    } else if (delta === -1) {
      if (part.quantity <= 1) {
        setDeleteModal({
          isOpen: true,
          title: "Списання запчастини",
          description: `Бажаєте повністю прибрати позицію "${part.partName}" зі специфікації матеріалів замовлення?`,
          confirmText: "Прибрати зі списку",
          onConfirm: async () => {
            await orderService.deletePartLine(part.id);
            handleRefresh();
          }
        });
        return;
      }
      try {
        await orderService.removePartQuantity(part.id, 1);
        handleRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeletePart = async (id: number, partName: string) => {
    setDeleteModal({
      isOpen: true,
      title: "Списання запчастини",
      description: `Ви впевнені, що хочете видалити запчастину "${partName}" та повернути її на склад/зняти з наряду?`,
      confirmText: "Видалити деталь",
      onConfirm: async () => {
        await orderService.deletePartLine(id);
        handleRefresh();
      }
    });
  };

  const handlePrint = async () => {
    if (!order) return;
    try {
      const pdfBlob = await orderService.printOrderInvoice(order.id);
      const fileURL = window.URL.createObjectURL(pdfBlob);
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `Order_No_${order.id}_Invoice.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      alert("Рахунок можна згенерувати лише для замовлень у статусі 'Готово' або 'Закрито'.");
    }
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr.split(".")[0]), "dd MMMM yyyy, HH:mm", { locale: uk });
    } catch {
      return "Невідома дата";
    }
  };

  const getVehicleModelOnly = (fullDetails: string) => {
    if (!fullDetails) return "—";
    return fullDetails.replace(/\(.*?\)/g, "").trim();
  };

  const getVehiclePlateOnly = (fullDetails: string) => {
    if (!fullDetails) return "—";
    const match = fullDetails.match(/\((.*?)\)/);
    return match ? match[1].trim() : "—";
  };

  if (initialLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400 font-sans">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <span className="text-xs font-black uppercase tracking-widest">Збір калькуляції наряду...</span>
      </div>
    );
  }

  if (!order) return null;

  const servicesTotal = services.reduce((sum, item) => sum + item.totalPrice, 0);
  const partsTotal = parts.reduce((sum, item) => sum + item.totalPrice, 0);
  const orderGrandTotal = servicesTotal + partsTotal;

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 select-none relative">
      
      {isBackgroundRefreshing && (
        <div className="absolute top-2 right-6 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100 shadow-sm z-50 animate-pulse">
          <Loader2 size={11} className="animate-spin" />
          <span>Оновлення даних...</span>
        </div>
      )}

      {/* ВЕРХНЯ ШАПКА КЕРУВАННЯ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/orders')} className="h-10 w-10 p-0 rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Замовлення-наряд № {order.id}</h1>
              
              {/* ОНОВЛЕНО: Замінили статичний бейдж на інтерактивний випадаючий список з мікро-лоадером */}
              <div className="flex items-center gap-1.5 relative">
                <select
                  value={order.statusId}
                  disabled={isStatusUpdating}
                  onChange={(e) => handleStatusChange(Number(e.target.value))}
                  className="px-2 py-0.5 border rounded-md text-[10px] font-black tracking-wide uppercase bg-blue-50 text-blue-600 border-blue-200 outline-none cursor-pointer focus:ring-1 focus:ring-blue-400 transition"
                >
                  {AVAILABLE_STATUSES.map((st) => (
                    <option key={st.id} value={st.id} className="bg-white text-slate-700 font-bold capitalize">
                      {st.name}
                    </option>
                  ))}
                </select>
                {isStatusUpdating && <Loader2 size={10} className="animate-spin text-blue-500 absolute -right-4" />}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{formatOrderDate(order.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handlePrint} className="h-10 text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer border-slate-200/80 hover:bg-slate-50 transition">
            <FileText size={14} className="text-emerald-500" />
            <span>Друк наряду</span>
          </Button>
          <Button type="button" variant="outline" onClick={handleRefresh} className="h-10 text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer border-slate-200/80 hover:bg-slate-50 transition">
            <RefreshCw size={14} className="text-slate-400" />
            <span>Оновити</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* ЛІВА КОЛОНКА */}
        <div className="space-y-4 lg:col-span-1">
          {/* АВТОМОБІЛЬ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Car size={15} className="text-blue-500" />
              <span>Транспортний засіб</span>
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400 block">Марка / Модель</Label>
                <span className="text-sm font-black text-slate-900">
                  {getVehicleModelOnly(order.vehicleDetails)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400 block">Держ. номер</Label>
                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono font-black text-xs text-slate-800 tracking-wide uppercase inline-block mt-0.5 shadow-sm">
                    {getVehiclePlateOnly(order.vehicleDetails)}
                  </span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400 block">Поточний пробіг</Label>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-1">
                    <Milestone size={12} className="text-slate-400" />
                    {order.mileage ? `${order.mileage.toLocaleString()} км` : "не вказано"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* КЛІЄНТ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <User size={14} className="text-blue-500" />
              <span>Автовласник</span>
            </div>
            <div className="space-y-2.5 text-xs font-bold text-slate-800">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400 block">ПІБ Клієнта</Label>
                <span className="text-slate-900 font-black text-sm">{order.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={13} className="text-slate-400" />
                <span>{order.clientPhone}</span>
              </div>
            </div>
          </div>

          {/* НОТАТКИ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Clipboard size={14} className="text-blue-500" />
              <span>Первинна скарга</span>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
              {order.notes || "Коментарі та скарги відсутні."}
            </p>
          </div>

          {/* ПІДСУМОК */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3.5">
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Підсумок калькуляції</div>
            <div className="space-y-2 border-b border-slate-800 pb-3 text-xs font-medium text-slate-300">
              <div className="flex justify-between"><span>Автороботи:</span><span className="font-bold text-white">{servicesTotal.toLocaleString()} грн</span></div>
              <div className="flex justify-between"><span>Запчастини:</span><span className="font-bold text-white">{partsTotal.toLocaleString()} грн</span></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Загалом:</span>
              <span className="text-xl font-black text-emerald-400 tracking-tight">{orderGrandTotal.toLocaleString()} грн</span>
            </div>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНА ЗОНА */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* БЛОК А: РОБОТИ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Wrench size={16} className="text-blue-600" />
                <span>Виконані послуги та автороботи</span>
              </div>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {services.length} ліній
              </span>
            </div>

            <Table>
              <TableHeader className="bg-transparent border-b border-slate-100">
                <TableRow className="hover:bg-transparent uppercase tracking-wider text-[9px] font-bold text-slate-400">
                  <TableHead className="h-8 pl-0">Назва послуги</TableHead>
                  <TableHead className="h-8 text-right">Ціна</TableHead>
                  <TableHead className="h-8 text-center w-24">К-сть (год)</TableHead>
                  <TableHead className="h-8 text-right">Сума</TableHead>
                  <TableHead className="h-8 w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold text-slate-700">
                {services.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-6 text-center text-slate-300 italic font-normal">Жодних послуг не додано</TableCell></TableRow>
                ) : (
                  services.map((s) => (
                    <TableRow key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <TableCell className="py-3 pl-0 font-bold text-slate-900">
                        {s.serviceName} {s.serviceId && <span className="text-[9px] bg-slate-100 px-1 py-0.5 rounded font-normal text-slate-400 ml-1">Прайс</span>}
                      </TableCell>
                      <TableCell className="py-3 text-right">{s.price.toLocaleString()} грн</TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handleServiceQuantityChange(s.id, s.quantity, -1, s.serviceName)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Minus size={11} /></button>
                          <span className="font-black text-slate-900 min-w-[14px] text-center">{s.quantity}</span>
                          <button type="button" onClick={() => handleServiceQuantityChange(s.id, s.quantity, 1, s.serviceName)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Plus size={11} /></button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right font-black text-slate-900">{s.totalPrice.toLocaleString()} грн</TableCell>
                      <TableCell className="py-3 text-center pr-0">
                        <Button type="button" variant="ghost" onClick={() => handleDeleteService(s.id, s.serviceName)} className="text-rose-500 hover:text-rose-700 h-7 w-7 p-0 rounded-lg cursor-pointer"><Trash2 size={13} /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-dashed border-slate-100 relative">
              <div className="sm:col-span-2 relative">
                <div className="relative">
                  <Input 
                    placeholder="Назва тех. операції (або введіть свою)" 
                    value={serviceQuery} 
                    onChange={(e) => {
                      setServiceQuery(e.target.value);
                      if (selectedServiceId) setSelectedServiceId(null); 
                    }} 
                    className="h-9 text-xs bg-slate-50/50 rounded-xl pr-8 font-medium" 
                  />
                  {isServiceSearching && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-2.5 top-2.5" />}
                </div>

                {searchedGlobalServices.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-36 overflow-y-auto mt-1 divide-y divide-slate-100 text-left font-sans">
                    {searchedGlobalServices.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedServiceId(srv.id);
                          setServiceQuery(srv.name || "");
                          setServicePrice(srv.defaultPrice !== undefined && srv.defaultPrice !== null ? srv.defaultPrice.toString() : "");
                          setSearchedGlobalServices([]);
                        }}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer text-[11px] font-bold text-slate-800 flex justify-between items-center"
                      >
                        <div className="truncate max-w-[240px]">{srv.name}</div>
                        <div className="text-blue-600 text-[10px] shrink-0 font-black">
                          {srv.defaultPrice !== undefined && srv.defaultPrice !== null ? `${srv.defaultPrice} грн` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input placeholder="Ціна (грн)" type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} className="h-9 text-xs bg-slate-50/50 rounded-xl font-bold" />
              <Button type="button" onClick={handleAddServiceSubmit} className="h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-1 cursor-pointer transition">
                <Plus size={13} /> Додати
              </Button>
            </div>
          </div>

          {/* БЛОК Б: ЗАПЧАСТИНИ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Package size={16} className="text-blue-600" />
                <span>Використані автозапчастини та матеріали</span>
              </div>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {parts.length} ліній
              </span>
            </div>

            <Table>
              <TableHeader className="bg-transparent border-b border-slate-100">
                <TableRow className="hover:bg-transparent uppercase tracking-wider text-[9px] font-bold text-slate-400">
                  <TableHead className="h-8 pl-0">Назва деталі / Артикул</TableHead>
                  <TableHead className="h-8 text-right">Ціна</TableHead>
                  <TableHead className="h-8 text-center w-24">Кількість</TableHead>
                  <TableHead className="h-8 text-right">Сума</TableHead>
                  <TableHead className="h-8 w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold text-slate-700">
                {parts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-6 text-center text-slate-300 italic font-normal">Жодних запчастин не списано</TableCell></TableRow>
                ) : (
                  parts.map((p) => (
                    <TableRow key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <TableCell className="py-3 pl-0 font-bold text-slate-900">
                        {p.partName} {p.partId && <span className="text-[9px] bg-emerald-50 px-1 py-0.5 rounded font-normal text-emerald-600 border border-emerald-100 ml-1">Склад</span>}
                      </TableCell>
                      <TableCell className="py-3 text-right">{p.price.toLocaleString()} грн</TableCell>
                      
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handlePartQuantityChange(p, -1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Minus size={11} /></button>
                          <span className="font-black text-slate-900 min-w-[14px] text-center">{p.quantity}</span>
                          <button type="button" onClick={() => handlePartQuantityChange(p, 1)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md cursor-pointer transition"><Plus size={11} /></button>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3 text-right font-black text-slate-900">{p.totalPrice.toLocaleString()} грн</TableCell>
                      <TableCell className="py-3 text-center pr-0">
                        <Button type="button" variant="ghost" onClick={() => handleDeletePart(p.id, p.partName)} className="text-rose-500 hover:text-rose-700 h-7 w-7 p-0 rounded-lg cursor-pointer"><Trash2 size={13} /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-3 border-t border-dashed border-slate-100 relative">
              <div className="sm:col-span-2 relative">
                <div className="relative">
                  <Input 
                    placeholder="Запчастина / Артикул SKU" 
                    value={partQuery} 
                    onChange={(e) => {
                      setPartQuery(e.target.value);
                      if (selectedPartId) setSelectedPartId(null); 
                    }} 
                    className="h-9 text-xs bg-slate-50/50 rounded-xl pr-8 font-medium" 
                  />
                  {isPartSearching && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-2.5 top-2.5" />}
                </div>

                {searchedGlobalParts.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-36 overflow-y-auto mt-1 divide-y divide-slate-100 text-left font-sans">
                    {searchedGlobalParts.map((prt) => (
                      <div
                        key={prt.id}
                        onClick={() => {
                          setSelectedPartId(prt.id);
                          setPartQuery(prt.name || "");
                          setPartPrice(prt.sellingPrice !== undefined && prt.sellingPrice !== null ? prt.sellingPrice.toString() : "");
                          setSearchedGlobalParts([]);
                        }}
                        className="p-2.5 hover:bg-slate-50/50 cursor-pointer text-[11px] font-bold text-slate-700 flex flex-col space-y-0.5"
                      >
                        <div className="text-slate-900 flex justify-between">
                          <span>{prt.name}</span>
                          <span className="text-emerald-600 text-[10px] font-black">
                            {prt.sellingPrice !== undefined && prt.sellingPrice !== null ? `${prt.sellingPrice} грн` : "—"}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-normal">
                          Артикул: {prt.sku || "—"} | Залишок: <span className="font-bold text-slate-600">{prt.quantity ?? 0} шт</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input placeholder="Ціна" type="number" value={partPrice} onChange={(e) => setPartPrice(e.target.value)} className="h-9 text-xs bg-slate-50/50 rounded-xl font-bold" />
              <Input placeholder="К-сть" type="number" value={partQuantity} onChange={(e) => setPartQuantity(e.target.value)} className="h-9 text-xs bg-slate-50/50 rounded-xl font-bold" />
              <Button type="button" onClick={handleAddPartSubmit} className="h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm gap-1 cursor-pointer transition">
                <Plus size={13} /> Списати
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* УНІВЕРСАЛЬНЕ ДИНАМІЧНЕ МОДАЛЬНЕ ВІКНО */}
      <Dialog 
        open={deleteModal.isOpen} 
        onOpenChange={(open) => !open && setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-6 font-sans border border-slate-100 shadow-2xl bg-white">
          <DialogHeader className="space-y-3">
            <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
                {deleteModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1">
                {deleteModal.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-5 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
              disabled={isDeleting}
              className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Скасувати
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  await deleteModal.onConfirm();
                  setDeleteModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  <span>Видалення...</span>
                </>
              ) : (
                <span>{deleteModal.confirmText}</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}