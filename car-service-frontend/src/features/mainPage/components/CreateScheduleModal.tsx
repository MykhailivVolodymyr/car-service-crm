"use client";

import { useState, useEffect } from "react";
import { mainPageService } from "../services/mainPageService";
import { MasterUserDto, WorkPostDto } from "../types/Schedule";
import { Search, Plus, Calendar, Clock, Wrench, LayoutGrid, Car, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  posts: WorkPostDto[];
  masters: MasterUserDto[];
  scheduleId?: number | null; // Якщо передано ID — працюємо в режимі редагування
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

  // Фіксація, чи прийшло замовлення з бекенду при редагуванні (щоб блокувати вкладку "Нове")
  const [hasInitialOrder, setHasInitialOrder] = useState<boolean>(false);

  // Стейт для ПОШУКУ існуючого замовлення
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Стейт для СТВОРЕННЯ НОВОГО замовлення (CreateOrderDto)
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState(""); 
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");             
  const [year, setYear] = useState("");           
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // ЕФЕКТ ДЛЯ РЕДАГУВАННЯ: Завантажуємо дані існуючого запису з бекенду при відкритті
  useEffect(() => {
    if (isOpen && scheduleId) {
      const loadScheduleData = async () => {
        try {
          const data = await mainPageService.getScheduleById(scheduleId);
          
          setPostId(data.postId.toString());
          setMechanicId(data.mechanicId.toString());
          setDescription(data.description || "");
          
          // Розбиваємо ISO рядок "2026-05-17T10:00:00" на дату та час для інпутів
          if (data.startTime) {
            const parts = data.startTime.split("T");
            setDate(parts[0]);
            setStartTime(parts[1].substring(0, 5));
          }
          if (data.endTime) {
            setEndTime(data.endTime.split("T")[1].substring(0, 5));
          }

          // Перевіряємо наявність замовлення у відповіді бекенду
          if (data.orderId) {
            setOrderMode('existing');
            setHasInitialOrder(true); // Запам'ятовуємо, що замовлення вже прив'язане
            setSelectedOrder({
              id: data.orderId,
              vehicleDetails: data.vehicleDisplay || "Автомобіль замовлення",
              clientName: data.clientName || "Вказаний клієнт",
              clientPhone: data.clientPhone || ""
            });
          } else {
            setOrderMode('none');
            setHasInitialOrder(false); // Це бронь без авто, вкладка "Нове" має бути доступною
            setSelectedOrder(null);
          }
        } catch (err) {
          console.error("Не вдалося завантажити дані запису розкладу:", err);
        }
      };
      loadScheduleData();
    } else if (isOpen && !scheduleId) {
      handleReset(); // Якщо додавання нового — очищаємо форму
    }
  }, [isOpen, scheduleId]);

  // Дебаунс пошуку активних замовлень
  useEffect(() => {
    if (orderMode !== 'existing' || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const searchOrders = async () => {
        try {
          const results = await mainPageService.searchActiveOrders(searchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error("Помилка пошуку замовлень:", err);
        }
      };
      searchOrders();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, orderMode]);

  // Хелпер для виведення помилок FluentValidation
  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    if (key && errors[key] && errors[key].length > 0) {
      return errors[key][0];
    }
    return null;
  };

  // Сабміт форми (POST або PUT)
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
          brandName,
          modelName,
          licensePlate,
          vin, 
          year: year ? Number(year) : null, 
          clientFullName: clientName,
          clientPhone,
          clientEmail, 
          notes
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
    setClientName(""); setClientPhone(""); setClientEmail(""); 
    setBrandName(""); setModelName(""); setLicensePlate(""); setVin(""); setYear(""); setNotes("");
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
              <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Пост / Бокс</label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <select value={postId} onChange={(e) => setPostId(e.target.value)} className="w-full pl-9 pr-3 h-10 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/40 cursor-pointer text-slate-700 font-medium">
                  <option value="">Оберіть пост</option>
                  {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button type="button" className="mt-1 text-[10px] text-slate-400 font-medium hover:text-blue-600 transition pl-1 cursor-pointer">
                + Створити бокс
              </button>
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
              <button type="button" className="mt-1 text-[10px] text-slate-400 font-medium hover:text-blue-600 transition pl-1 cursor-pointer">
                + Створити майстра
              </button>
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
                Без замовлення
              </Button>
              <Button type="button" variant="outline" onClick={() => setOrderMode('existing')} className={`h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 border ${orderMode === 'existing' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'}`}>
                <Search size={14} />
                Обрати існуюче активне
              </Button>
              {/* ФІКС: Кнопка блокується тільки тоді, коли у запису вже початково є прив'язане замовлення з бекенду */}
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

            {/* РЕЖИМ А: Пошук існуючого */}
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

            {/* РЕЖИМ Б: Секція створення нового замовлення */}
            {orderMode === 'new' && !hasInitialOrder && (
              <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-xl p-4 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold border-b border-emerald-100/50 pb-1.5">
                  <Car size={14} />
                  <span>Новий автомобіль та клієнт</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("clientFullName") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Ім'я клієнта</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Проць Олександр" className={`w-full px-3 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("clientFullName") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("clientFullName") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("clientFullName")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("clientPhone") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Телефон клієнта</label>
                    <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+380123456789" className={`w-full px-3 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("clientPhone") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("clientPhone") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("clientPhone")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("clientEmail") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Email клієнта</label>
                    <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="olexandr@gmail.com" className={`w-full px-3 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("clientEmail") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("clientEmail") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("clientEmail")}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("brandName") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Марка авто</label>
                    <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Opel" className={`w-full px-2 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("brandName") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("brandName") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("brandName")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("modelName") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Модель авто</label>
                    <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Astra" className={`w-full px-2 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("modelName") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("modelName") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("modelName")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("licensePlate") ? "text-rose-500 font-bold" : "text-slate-400"}`}>Держ. номер</label>
                    <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="BC2381AO" className={`w-full px-2 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("licensePlate") ? "border-rose-400 bg-rose-50/10 focus:border-rose-500" : "border-slate-200 focus:border-emerald-500"}`} />
                    {getFieldError("licensePlate") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("licensePlate")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("Year") ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>Рік випуску *</label>
                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2017" className={`w-full px-2 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 ${getFieldError("Year") ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-500'}`} />
                    {getFieldError("Year") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("Year")}</span>}
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("Vin") ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>VIN код *</label>
                    <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="W0L0AHM75..." className={`w-full px-2 h-9 border rounded-xl bg-white focus:outline-none font-medium text-slate-700 uppercase ${getFieldError("Vin") ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-500'}`} />
                    {getFieldError("Vin") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("Vin")}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase tracking-wider mb-1">Внутрішні нотатки до замовлення</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Скарга на сторонній звук при гальмуванні..." className="w-full px-3 h-9 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700" />
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