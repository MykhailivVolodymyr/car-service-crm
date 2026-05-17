"use client";

import { useState, useEffect } from "react";
import { mainPageService } from "../services/mainPageService";
import { orderService } from "@/features/orders/services/orderService"; 
import { MasterUserDto, WorkPostDto } from "../types/Schedule";
import { Search, Plus, Calendar, Clock, Wrench, LayoutGrid, Car, AlertCircle, User, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  posts: WorkPostDto[];
  masters: MasterUserDto[];
  scheduleId?: number | null;
}

export default function CreateScheduleModal({ isOpen, onClose, onSuccess, posts, masters, scheduleId }: CreateScheduleModalProps) {
  const isEditMode = !!scheduleId;

  // Стейт форми розкладу (CreateScheduleDto)
  const [postId, setPostId] = useState<string>("");
  const [mechanicId, setMechanicId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Режим прив'язки замовлення: 'none' | 'existing' | 'new'
  const [orderMode, setOrderMode] = useState<'none' | 'existing' | 'new'>('none');
  const [hasInitialOrder, setHasInitialOrder] = useState<boolean>(false);

  // Стейт для ПОШУКУ існуючого ЗАМОВЛЕННЯ
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // ==================================================
  // СТВОРЕННЯ НОВОГО ЗАМОВЛЕННЯ (Гнучкі автокомпліти)
  // ==================================================
  
  // Клієнт
  const [clientMode, setClientMode] = useState<'search' | 'create'>('search');
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState(""); 

  // Автомобіль
  const [vehicleMode, setVehicleMode] = useState<'search' | 'create'>('search');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [vehicleSearchResults, setVehicleSearchResults] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Кастомні автокомпліти для нових Брендів та Моделей
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [brandSearchResults, setBrandSearchResults] = useState<any[]>([]);

  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [modelSearchResults, setModelSearchResults] = useState<any[]>([]);

  // Інші поля авто
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");             
  const [year, setYear] = useState("");           
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Редагування: завантаження первинних даних розкладу
  useEffect(() => {
    if (isOpen && scheduleId) {
      const loadScheduleData = async () => {
        try {
          const data = await mainPageService.getScheduleById(scheduleId);
          
          setPostId(data.postId.toString());
          setMechanicId(data.mechanicId.toString());
          setDescription(data.description || "");
          
          if (data.startTime) {
            const parts = data.startTime.split("T");
            setDate(parts[0]);
            setStartTime(parts[1].substring(0, 5));
          }
          if (data.endTime) {
            setEndTime(data.endTime.split("T")[1].substring(0, 5));
          }

          if (data.orderId) {
            setOrderMode('existing');
            setHasInitialOrder(true);
            setSelectedOrder({
              id: data.orderId,
              vehicleDetails: data.vehicleDisplay || "Автомобіль замовлення",
              clientName: data.clientName || "Вказаний клієнт",
              clientPhone: data.clientPhone || ""
            });
          } else {
            setOrderMode('none');
            setHasInitialOrder(false);
            setSelectedOrder(null);
          }
        } catch (err) {
          console.error("Не вдалося завантажити дані запису розкладу:", err);
        }
      };
      loadScheduleData();
    } else if (isOpen && !scheduleId) {
      handleReset();
    }
  }, [isOpen, scheduleId]);

  // 1. Дебаунс для пошуку існуючого замовлення
  useEffect(() => {
    if (orderMode !== 'existing' || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      mainPageService.searchActiveOrders(searchTerm)
        .then(res => setSearchResults(res))
        .catch(err => console.error(err));
    }, 400);
    
    return () => { clearTimeout(delay); };
  }, [searchTerm, orderMode]);

  // 2. Дебаунс для пошуку клієнта
  useEffect(() => {
    if (orderMode !== 'new' || clientMode !== 'search' || !clientSearchTerm.trim()) {
      setClientSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      orderService.searchClients(clientSearchTerm)
        .then(res => setClientSearchResults(res))
        .catch(err => console.error(err));
    }, 400);
    
    return () => { clearTimeout(delay); };
  }, [clientSearchTerm, clientMode, orderMode]);

  // 3. ОНОВЛЕНО: Дебаунс пошуку авто з фільтрацією строго за обраним клієнтом на фронті
  useEffect(() => {
    if (orderMode !== 'new' || vehicleMode !== 'search') {
      setVehicleSearchResults([]);
      return;
    }
    if (!vehicleSearchTerm.trim() && !selectedClient) {
      setVehicleSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      orderService.searchVehicles(vehicleSearchTerm)
        .then(res => {
          // Якщо обрано існуючого клієнта — фільтруємо масив, залишаючи тільки його ТЗ
          if (selectedClient) {
            const filtered = res.filter((v: any) => v.clientId === selectedClient.id);
            setVehicleSearchResults(filtered);
          } else {
            setVehicleSearchResults(res);
          }
        })
        .catch(err => console.error(err));
    }, 400);
    
    return () => { clearTimeout(delay); };
  }, [vehicleSearchTerm, vehicleMode, orderMode, selectedClient]);

  // 4. Дебаунс для пошуку БРЕНДІВ
  useEffect(() => {
    if (orderMode !== 'new' || vehicleMode !== 'create' || !brandSearchTerm.trim()) {
      setBrandSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      orderService.searchBrands(brandSearchTerm)
        .then(res => setBrandSearchResults(res))
        .catch(err => console.error(err));
    }, 350);
    
    return () => { clearTimeout(delay); };
  }, [brandSearchTerm, vehicleMode, orderMode]);

  // 5. ОНОВЛЕНО: Дебаунс пошуку МОДЕЛЕЙ з фільтрацією на фронті за введеною маркою
  useEffect(() => {
    if (orderMode !== 'new' || vehicleMode !== 'create' || !modelSearchTerm.trim()) {
      setModelSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      orderService.searchModels(modelSearchTerm)
        .then(res => {
          // Якщо в полі "Марка (Бренд)" є текст — залишаємо моделі тільки цієї марки
          if (brandSearchTerm.trim()) {
            const filtered = res.filter((m: any) => 
              m.brandName?.toLowerCase() === brandSearchTerm.toLowerCase() ||
              m.vehicleBrandName?.toLowerCase() === brandSearchTerm.toLowerCase()
            );
            setModelSearchResults(filtered);
          } else {
            setModelSearchResults(res);
          }
        })
        .catch(err => console.error(err));
    }, 350);
    
    return () => { clearTimeout(delay); };
  }, [modelSearchTerm, brandSearchTerm, vehicleMode, orderMode]);


  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key && errors[key]?.length > 0 ? errors[key][0] : null;
  };

  // САБМІТ ФОРМИ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); 

    if (!postId || !mechanicId || !date || !startTime || !endTime) {
      setErrors({ _form: ["Будь ласка, заповніть основні поля розкладу (Пост, Майстер, Дата та Час)"] });
      return;
    }

    try {
      setSubmitting(true);
      let finalOrderId: number | null = null;

      if (orderMode === 'new') {
        const newOrderData = {
          statusId: 1, 
          notes,
          
          clientId: clientMode === 'search' && selectedClient ? selectedClient.id : null,
          vehicleId: vehicleMode === 'search' && selectedVehicle ? selectedVehicle.id : null,

          clientFullName: clientMode === 'create' ? clientName : null,
          clientPhone: clientMode === 'create' ? clientPhone : null,
          clientEmail: clientMode === 'create' ? clientEmail : null, 
          
          brandName: vehicleMode === 'create' ? brandSearchTerm : null,
          modelName: vehicleMode === 'create' ? modelSearchTerm : null,
          licensePlate: vehicleMode === 'create' ? licensePlate : null,
          vin: vehicleMode === 'create' ? vin : null, 
          year: vehicleMode === 'create' && year ? Number(year) : null, 
        };

        const createdOrder = await mainPageService.createOrder(newOrderData);
        finalOrderId = createdOrder.id;
      } 
      else if (orderMode === 'existing' && selectedOrder) {
        finalOrderId = selectedOrder.id;
      }

      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const scheduleData = {
        orderId: finalOrderId,
        postId: Number(postId),
        mechanicId: Number(mechanicId),
        startTime: startDateTime,
        endTime: endDateTime,
        description: description || null
      };

      if (isEditMode) {
        await mainPageService.updateSchedule(scheduleId!, scheduleData);
      } else {
        await mainPageService.createSchedule(scheduleData);
      }
      
      handleReset();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Помилка збереження запису:", err);
      if (err.response && err.response.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          _form: [err.response?.data?.title || "Відбулася непередбачувана помилка при обробці запиту."]
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPostId(""); setMechanicId(""); setDate(""); setStartTime(""); setEndTime(""); setDescription("");
    setOrderMode('none'); setHasInitialOrder(false); setSearchTerm(""); setSelectedOrder(null);
    
    setClientMode('search'); setClientSearchTerm(""); setClientSearchResults([]); setSelectedClient(null);
    setClientName(""); setClientPhone(""); setClientEmail(""); 
    
    setVehicleMode('search'); setVehicleSearchTerm(""); setVehicleSearchResults([]); setSelectedVehicle(null);
    setBrandSearchTerm(""); setBrandSearchResults([]); 
    setModelSearchTerm(""); setModelSearchResults([]); 
    setLicensePlate(""); setVin(""); setYear(""); setNotes("");
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[760px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans max-h-[90vh] overflow-y-auto antialiased">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={18} />
            <span>{isEditMode ? `Редагування запису в розкладі № ${scheduleId}` : "Створення нового запису в розклад"}</span>
          </DialogTitle>
        </DialogHeader>

        {errors._form && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-start gap-2 text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>{errors._form.map((msg, i) => <p key={i}>{msg}</p>)}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-xs font-semibold text-slate-600">
          
          {/* БЛОК 1: ОСНОВНІ ПАРАМЕТРИ РОЗКЛАДУ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Post / Бокс</label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <select value={postId} onChange={(e) => setPostId(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 cursor-pointer text-slate-700 font-medium">
                  <option value="">Оберіть пост</option>
                  {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Відповідальний Майстер</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <select value={mechanicId} onChange={(e) => setMechanicId(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 cursor-pointer text-slate-700 font-medium">
                  <option value="">Оберіть майстра</option>
                  {masters.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Дата візиту</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 cursor-pointer text-slate-700 font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Час початку</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 text-slate-700 font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Час завершення</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 text-slate-700 font-medium" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Опис проблеми / Первинна послуга</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Наприклад: Заміна передніх гальмівних колодок..." rows={2} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 resize-none font-medium text-slate-700 placeholder:font-normal text-xs" />
          </div>

          {/* БЛОК 2: УПРАВЛІННЯ ЗВ'ЯЗКОМ ІЗ ЗАМОВЛЕННЯМ */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <label className="block text-slate-800 font-bold text-sm tracking-tight">Прив'язка до замовлення-наряду</label>
            
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => { setOrderMode('none'); setSelectedOrder(null); }} className={`h-9 px-3.5 rounded-xl text-xs font-bold border ${orderMode === 'none' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'}`}>
                Без замовлення (Бронювання)
              </Button>
              <Button type="button" variant="outline" onClick={() => setOrderMode('existing')} className={`h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 border ${orderMode === 'existing' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'}`}>
                <Search size={14} />
                Обрати існуюче активне
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={hasInitialOrder}
                onClick={() => setOrderMode('new')} 
                className={`h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 border ${orderMode === 'new' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Plus size={14} />
                Створити нове замовлення
              </Button>
            </div>

            {/* Пошук існуючого замовлення */}
            {orderMode === 'existing' && (
              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 space-y-3">
                {!selectedOrder ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="text" placeholder="Введіть держ. номер авто або ПІБ клієнта..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700" />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg p-1 z-50 max-h-40 overflow-y-auto">
                        {searchResults.map((order) => (
                          <div key={order.id} onClick={() => setSelectedOrder(order)} className="p-2.5 text-xs hover:bg-slate-50 rounded-lg cursor-pointer transition flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Car size={13} className="text-slate-400" />
                                <span>{order.vehicleDetails}</span>
                              </div>
                              <div className="text-slate-400 text-[11px] font-medium mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center pl-4.5">
                                <span>{order.clientName}</span>
                                <span className="text-slate-300">•</span>
                                <span>{order.clientPhone}</span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">№ {order.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded mr-2">ОБРАНО ЗАМОВЛЕННЯ №{selectedOrder.id}</span>
                      <strong className="text-slate-800 text-sm ml-1">{selectedOrder.vehicleDetails}</strong>
                      <div className="text-slate-500 mt-1 pl-1 font-medium">{selectedOrder.clientName} ({selectedOrder.clientPhone})</div>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => { setSelectedOrder(null); setOrderMode('none'); }} className="h-7 px-2 text-rose-500 hover:bg-rose-50 rounded-lg text-[11px]">Змінити</Button>
                  </div>
                )}
              </div>
            )}

            {/* Секція розширеного створення нового замовлення */}
            {orderMode === 'new' && !hasInitialOrder && (
              <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 space-y-5 animate-in fade-in duration-200">
                
                {/* 1. ПІДБЛОК: КЛІЄНТ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                      <User size={14} className="text-blue-500" />
                      <span>Клієнт (Власник)</span>
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button type="button" onClick={() => { setClientMode('search'); setSelectedClient(null); }} className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${clientMode === 'search' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Пошук в базі</button>
                      <button type="button" onClick={() => { setClientMode('create'); setSelectedClient(null); }} className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${clientMode === 'create' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Новий клієнт</button>
                    </div>
                  </div>

                  {clientMode === 'search' ? (
                    !selectedClient ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Введіть ПІБ або номер телефону клієнта..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="w-full pl-9 pr-3 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700" />
                        {clientSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 max-h-36 overflow-y-auto">
                            {clientSearchResults.map(c => (
                              <div key={c.id} onClick={() => setSelectedClient(c)} className="p-2 text-xs hover:bg-blue-50/50 rounded-lg cursor-pointer flex justify-between items-center">
                                <span className="font-bold text-slate-700">{c.fullName}</span>
                                <span className="text-slate-400 text-[11px]">{c.phone}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-blue-50/30 border border-blue-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CheckCircle2 size={14} />
                          <span>Обрано: <strong>{selectedClient.fullName}</strong> ({selectedClient.phone})</span>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => setSelectedClient(null)} className="h-6 px-2 text-slate-400 hover:text-rose-500 text-[10px]">Скинути</Button>
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 border border-slate-100 rounded-xl">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">ПІБ Клієнта</label>
                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Проць Олександр" className="w-full px-3 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Телефон</label>
                        <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+380..." className="w-full px-3 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Email</label>
                        <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="alex@gmail.com" className="w-full px-3 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. ПІДБЛОК: АВТОМОБІЛЬ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                      <Car size={14} className="text-emerald-500" />
                      <span>Транспортний засіб</span>
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button type="button" onClick={() => { setVehicleMode('search'); setSelectedVehicle(null); }} className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${vehicleMode === 'search' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Пошук в базі</button>
                      <button type="button" onClick={() => { setVehicleMode('create'); setSelectedVehicle(null); }} className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${vehicleMode === 'create' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Нове авто</button>
                    </div>
                  </div>

                  {vehicleMode === 'search' ? (
                    !selectedVehicle ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Введіть держ. номер або останні цифри VIN..." value={vehicleSearchTerm} onChange={(e) => setVehicleSearchTerm(e.target.value)} className="w-full pl-9 pr-3 h-9 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-700" />
                        {vehicleSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 max-h-36 overflow-y-auto">
                            {vehicleSearchResults.map(v => (
                              <div key={v.id} onClick={() => setSelectedVehicle(v)} className="p-2 text-xs hover:bg-emerald-50/50 rounded-lg cursor-pointer flex justify-between items-center">
                                <span className="font-bold text-slate-700">{v.brandName} {v.modelName} <span className="text-slate-400 font-medium">({v.licensePlate})</span></span>
                                <span className="text-slate-400 text-[10px] font-mono">{v.vin}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50/40 border border-emerald-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 size={14} />
                          <span>Обрано: <strong>{selectedVehicle.brandName} {selectedVehicle.modelName}</strong> [{selectedVehicle.licensePlate}]</span>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => setSelectedVehicle(null)} className="h-6 px-2 text-slate-400 hover:text-rose-500 text-[10px]">Скинути</Button>
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-white p-3 border border-slate-100 rounded-xl relative">
                      
                      {/* Живий автокомпліт БРЕНДУ */}
                      <div className="relative">
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Марка (Бренд)</label>
                        <input type="text" value={brandSearchTerm} onChange={(e) => setBrandSearchTerm(e.target.value)} placeholder="Opel" className="w-full px-2 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                        {brandSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 max-h-28 overflow-y-auto">
                            {brandSearchResults.map(b => (
                              <div key={b.id} onClick={() => { setBrandSearchTerm(b.name); setBrandSearchResults([]); }} className="p-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer">{b.name}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Живий автокомпліт МОДЕЛІ */}
                      <div className="relative">
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Модель авто</label>
                        <input type="text" value={modelSearchTerm} onChange={(e) => setModelSearchTerm(e.target.value)} placeholder="Astra" className="w-full px-2 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                        {modelSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 max-h-28 overflow-y-auto">
                            {modelSearchResults.map(m => (
                              <div key={m.id} onClick={() => { setModelSearchTerm(m.name); setModelSearchResults([]); }} className="p-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer">{m.name}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Держ. номер</label>
                        <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="BC2381AO" className="w-full px-2 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700 uppercase" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Рік випуску</label>
                        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2017" className="w-full px-2 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">VIN код</label>
                        <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="W0L0..." className="w-full px-2 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700 uppercase" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. ПІДБЛОК: НОТАТКИ ЗАМОВЛЕННЯ */}
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase tracking-wider mb-1">Внутрішні нотатки до замовлення</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Скарга на сторонній звук при гальмуванні або планове ТО..." className="w-full px-3 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-700" />
                </div>
              </div>
            )}
          </div>

          {/* НИЖНЯ ПАНЕЛЬ */}
          <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => { handleReset(); onClose(); }} className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer">
              Скасувати
            </Button>
            <Button type="submit" disabled={submitting} className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-50">
              {submitting ? "Збереження..." : isEditMode ? "Зберегти зміни" : "Створити запис"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}