"use client";

import { useState, useEffect } from "react";
import { CreateOrderDto, VehicleDto, ClientDto, VehicleBrandDto, VehicleModelDto } from "../types/Order";
import { orderService } from "../services/orderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Car, User, Hash, Milestone, Clipboard, Search, Loader2 } from "lucide-react";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId?: number | null; // Додаємо опціональний ID для режиму редагування
}

export default function CreateOrderModal({ isOpen, onClose, onSuccess, orderId }: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Лоадер для стягування інфи з БД
  const [vehicleMode, setVehicleMode] = useState<"existing" | "new">("existing");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");

  // Живий пошук існуючих машин СТО
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [searchedVehicles, setSearchedVehicles] = useState<VehicleDto[]>([]);
  const [isVehicleSearching, setIsVehicleSearching] = useState(false);
  const [selectedVehicleText, setSelectedVehicleText] = useState("");

  // Живий пошук брендів (для нової машини)
  const [brandQuery, setBrandQuery] = useState("");
  const [searchedBrands, setSearchedBrands] = useState<VehicleBrandDto[]>([]);
  const [isBrandSearching, setIsBrandSearching] = useState(false);
  const [selectedBrandText, setSelectedBrandText] = useState("");

  // Живий пошук моделей (для нової машини)
  const [modelQuery, setModelQuery] = useState("");
  const [searchedModels, setSearchedModels] = useState<VehicleModelDto[]>([]);
  const [isModelSearching, setIsModelSearching] = useState(false);
  const [selectedModelText, setSelectedModelText] = useState("");

  // Живий пошук існуючих клієнтів
  const [clientQuery, setClientQuery] = useState("");
  const [searchedClients, setSearchedClients] = useState<ClientDto[]>([]);
  const [isClientSearching, setIsClientSearching] = useState(false);
  const [selectedClientText, setSelectedClientText] = useState("");

  // CreateOrderDto state
  const [formData, setFormData] = useState({
    vehicleId: null as number | null,
    statusId: 1,
    modelId: null as number | null,
    brandName: "",
    modelName: "",
    vin: "",
    licensePlate: "",
    year: "" as string | number,
    clientId: null as number | null,
    clientFullName: "",
    clientPhone: "",
    clientEmail: "",
    mileage: "" as string | number,
    notes: "",
  });

  // ЛОГІКА ІНІЦІАЛІЗАЦІЇ ФОРМИ (Створення VS Редагування)
  useEffect(() => {
    const loadOrderData = async () => {
      if (isOpen && orderId) {
        try {
          setInitialLoading(true);
          const order = await orderService.getOrderById(orderId);
          
          setFormData({
            vehicleId: order.vehicleId,
            statusId: order.statusId,
            modelId: null,
            brandName: "",
            modelName: "",
            vin: "",
            licensePlate: "",
            year: "",
            clientId: order.clientId,
            clientFullName: order.clientName,
            clientPhone: order.clientPhone,
            clientEmail: "",
            mileage: order.mileage || "",
            notes: order.notes || "",
          });

          // Оскільки авто вже існує, підставляємо його деталі у строку пошуку
          setVehicleQuery(order.vehicleDetails);
          setSelectedVehicleText(order.vehicleDetails);
          setVehicleMode("existing");
        } catch (err) {
          console.error("Помилка завантаження деталей замовлення:", err);
          alert("Не вдалося завантажити дані замовлення з бази.");
        } finally {
          setInitialLoading(false);
        }
      } else if (isOpen && !orderId) {
        // Очищення стейту під СТВОРЕННЯ
        setFormData({
          vehicleId: null,
          statusId: 1,
          modelId: null,
          brandName: "",
          modelName: "",
          vin: "",
          licensePlate: "",
          year: "",
          clientId: null,
          clientFullName: "",
          clientPhone: "",
          clientEmail: "",
          mileage: "",
          notes: "",
        });
        setVehicleQuery("");
        setBrandQuery("");
        setModelQuery("");
        setClientQuery("");
        setSearchedVehicles([]);
        setSearchedBrands([]);
        setSearchedModels([]);
        setSearchedClients([]);
        setSelectedVehicleText("");
        setSelectedBrandText("");
        setSelectedModelText("");
        setSelectedClientText("");
        setVehicleMode("existing");
        setClientMode("existing");
      }
    };

    loadOrderData();
  }, [isOpen, orderId]);

  // ДЕБАУНС: Пошук існуючих авто СТО
  useEffect(() => {
    if (vehicleMode !== "existing" || vehicleQuery.trim().length < 2 || selectedVehicleText === vehicleQuery) {
      setSearchedVehicles([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsVehicleSearching(true);
        const res = await orderService.searchVehicles(vehicleQuery);
        setSearchedVehicles(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsVehicleSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [vehicleQuery, vehicleMode, selectedVehicleText]);

  // ДЕБАУНС: Пошук БРЕНДІВ (Марки авто)
  useEffect(() => {
    if (vehicleMode !== "new" || brandQuery.trim().length < 1 || selectedBrandText === brandQuery) {
      setSearchedBrands([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsBrandSearching(true);
        const res = await orderService.searchBrands(brandQuery);
        setSearchedBrands(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsBrandSearching(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [brandQuery, vehicleMode, selectedBrandText]);

  // ДЕБАУНС: Пошук МОДЕЛЕЙ авто
  useEffect(() => {
    if (vehicleMode !== "new" || modelQuery.trim().length < 1 || selectedModelText === modelQuery) {
      setSearchedModels([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsModelSearching(true);
        const res = await orderService.searchModels(modelQuery);
        
        if (formData.brandName) {
          setSearchedModels(res.filter(m => m.brandName.toLowerCase() === formData.brandName.toLowerCase()));
        } else {
          setSearchedModels(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsModelSearching(false);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [modelQuery, vehicleMode, selectedModelText, formData.brandName]);

  // ДЕБАУНС: Пошук існуючих КЛІЄНТІВ
  useEffect(() => {
    if (vehicleMode !== "new" || clientMode !== "existing" || clientQuery.trim().length < 2 || selectedClientText === clientQuery) {
      setSearchedClients([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsClientSearching(true);
        const res = await orderService.searchClients(clientQuery);
        setSearchedClients(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsClientSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [clientQuery, clientMode, vehicleMode, selectedClientText]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (vehicleMode === "existing" && !formData.vehicleId) {
      alert("Будь ласка, оберіть автомобіль зі списку пошуку.");
      return;
    }
    if (vehicleMode === "new" && !formData.brandName) {
      alert("Будь ласка, оберіть офіційну марку автомобіля.");
      return;
    }
    if (vehicleMode === "new" && clientMode === "existing" && !formData.clientId) {
      alert("Будь ласка, оберіть клієнта зі списку пошуку.");
      return;
    }

    try {
      setLoading(true);
      const dto: CreateOrderDto = {
        statusId: formData.statusId,
        vehicleId: vehicleMode === "existing" ? formData.vehicleId : null,
        modelId: vehicleMode === "new" ? formData.modelId : null,
        brandName: vehicleMode === "new" ? formData.brandName : null,
        modelName: vehicleMode === "new" ? formData.modelName : null,
        vin: vehicleMode === "new" ? formData.vin : null,
        licensePlate: vehicleMode === "new" ? formData.licensePlate : null,
        year: vehicleMode === "new" && formData.year ? Number(formData.year) : null,
        clientId: vehicleMode === "new" && clientMode === "existing" ? formData.clientId : null,
        clientFullName: vehicleMode === "new" && clientMode === "new" ? formData.clientFullName : null,
        clientPhone: vehicleMode === "new" && clientMode === "new" ? formData.clientPhone : null,
        clientEmail: vehicleMode === "new" && clientMode === "new" ? formData.clientEmail : null,
        mileage: formData.mileage ? Number(formData.mileage) : null,
        notes: formData.notes || null,
      };

      if (orderId) {
        // Режим Редагування (PUT)
        await orderService.updateOrder(orderId, dto);
      } else {
        // Режим Створення (POST)
        await orderService.createOrder(dto);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Помилка збереження замовлення на СТО.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-[620px] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 font-sans antialiased text-xs font-semibold text-slate-600 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clipboard size={18} className="text-blue-600" />
            {orderId ? `Редагування замовлення-наряду № ${orderId}` : "Оформлення нового замовлення-наряду"}
          </DialogTitle>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {orderId ? "Оновіть поточний стан ремонту автомобіля або супутні нотатки менеджера." : "Всі поля вибору автомобілів та автовласників тепер синхронізовані з довідниками СТО."}
          </p>
        </DialogHeader>

        {initialLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 select-none">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Отримання даних наряду...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            
            {/* СЕЛЕКТ СТАТУСУ (З'ЯВЛЯЄТЬСЯ ТІЛЬКИ ПРИ РЕДАГУВАННІ) */}
            {orderId && (
              <div className="space-y-1.5 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <Label className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Поточний статус ремонту</Label>
                <select
                  value={formData.statusId}
                  onChange={(e) => setFormData({ ...formData, statusId: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition cursor-pointer shadow-sm"
                >
                  <option value={1}>Новий</option>
                  <option value={2}>В роботі</option>
                  <option value={3}>Очікує запчастини</option>
                  <option value={4}>Готово</option>
                  <option value={5}>Закрито</option>
                </select>
              </div>
            )}

            {/* ТИП АВТОМОБІЛЯ */}
            <div className="space-y-2">
              <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Транспортний засіб</Label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  type="button"
                  disabled={!!orderId} // При редагуванні не міняємо логіку "нове/існуюче"
                  onClick={() => setVehicleMode("existing")}
                  className={`py-2 text-center rounded-lg font-bold transition text-xs ${
                    orderId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${vehicleMode === "existing" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Розумний пошук авто
                </button>
                <button
                  type="button"
                  disabled={!!orderId}
                  onClick={() => setVehicleMode("new")}
                  className={`py-2 text-center rounded-lg font-bold transition text-xs ${
                    orderId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${vehicleMode === "new" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  + Оформити нове авто
                </button>
              </div>
            </div>

            {/* СЦЕНАРІЙ А: АВТОКОМПЛІТ ІСНУЮЧОЇ МАШИНИ */}
            {vehicleMode === "existing" && (
              <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/50 space-y-2.5 relative">
                <Label className="text-blue-700 font-bold flex items-center gap-1">
                  <Search size={12} /> Транспортний засіб у наряді
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Введіть держномер, VIN-код або ПІБ власника..."
                    value={vehicleQuery}
                    disabled={!!orderId} // Забороняємо змінювати авто для вже створеного наряду
                    onChange={(e) => setVehicleQuery(e.target.value)}
                    className={`bg-white border-slate-200 pr-10 font-medium ${orderId ? "opacity-70 text-slate-800 cursor-not-allowed" : ""}`}
                  />
                  {isVehicleSearching && <Loader2 size={16} className="animate-spin text-blue-500 absolute right-3 top-3" />}
                </div>

                {searchedVehicles.length > 0 && (
                  <div className="absolute left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto mt-1 divide-y divide-slate-100 text-left font-sans">
                    {searchedVehicles.map((v) => {
                      const displayText = `${v.brandName} ${v.modelName} [${v.licensePlate}] - Власник: ${v.clientFullName || "Не вказано"}`;
                      return (
                        <div
                          key={v.id}
                          onClick={() => {
                            setFormData({ ...formData, vehicleId: v.id });
                            setVehicleQuery(displayText);
                            setSelectedVehicleText(displayText);
                            setSearchedVehicles([]);
                          }}
                          className="p-2.5 hover:bg-slate-50 cursor-pointer transition text-xs font-semibold text-slate-700 flex flex-col space-y-0.5"
                        >
                          <div className="text-slate-950 font-bold">{v.brandName} {v.modelName} ({v.licensePlate})</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            VIN: {v.vin} | Власник: {v.clientFullName} ({v.clientPhone})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* СЦЕНАРІЙ Б: НОВА МАШИНА З АВТОКОМПЛІТОМ БРЕНДІВ ТА МОДЕЛЕЙ */}
            {vehicleMode === "new" && (
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3.5">
                <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                  <Car size={14} className="text-blue-500" />
                  <span>Характеристики нового автомобіля СТО</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 relative">
                  <div className="space-y-1 relative">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Марка авто *</Label>
                    <div className="relative">
                      <Input placeholder="Введіть марку (напр. BMW)" required value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} className="bg-white" />
                      {isBrandSearching && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-2 top-3" />}
                    </div>

                    {searchedBrands.length > 0 && (
                      <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto mt-1 divide-y divide-slate-100 text-left">
                        {searchedBrands.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setFormData({ ...formData, brandName: b.name, modelId: null, modelName: "" });
                              setBrandQuery(b.name);
                              setSelectedBrandText(b.name);
                              setModelQuery("");
                              setSearchedBrands([]);
                            }}
                            className="p-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800"
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Модель *</Label>
                    <div className="relative">
                      <Input placeholder="Введіть модель (напр. X5)" required value={modelQuery} onChange={(e) => setModelQuery(e.target.value)} className="bg-white" />
                      {isModelSearching && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-2 top-3" />}
                    </div>

                    {searchedModels.length > 0 && (
                      <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto mt-1 divide-y divide-slate-100 text-left">
                        {searchedModels.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                modelId: m.id, 
                                modelName: m.name,
                                brandName: m.brandName 
                              });
                              setModelQuery(m.name);
                              setSelectedModelText(m.name);
                              setBrandQuery(m.brandName);
                              setSelectedBrandText(m.brandName);
                              setSearchedModels([]);
                            }}
                            className="p-2 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800 flex justify-between"
                          >
                            <span>{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{m.brandName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Держ. Номер *</Label>
                    <Input placeholder="BC2381AO" required={vehicleMode === "new"} value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} className="bg-white font-mono uppercase text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Рік випуску</Label>
                    <Input type="number" placeholder="2018" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="bg-white text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">VIN-код кузова *</Label>
                  <Input placeholder="Введіть 17 знаків VIN" required={vehicleMode === "new"} value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} className="bg-white font-mono uppercase text-xs" />
                </div>

                {/* УПРАВЛІННЯ ВЛАСНИКОМ ДЛЯ НОВОГО АВТО */}
                <div className="border-t border-slate-200/60 pt-3 mt-1 space-y-2.5 relative">
                  <Label className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block">Автовласник замовлення</Label>
                  <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-lg border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setClientMode("existing")}
                      className={`py-1 text-center rounded-md font-bold transition text-[11px] cursor-pointer ${
                        clientMode === "existing" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Пошук існуючого клієнта
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientMode("new")}
                      className={`py-1 text-center rounded-md font-bold transition text-[11px] cursor-pointer ${
                        clientMode === "new" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      + Новий контрагент СТО
                    </button>
                  </div>

                  {clientMode === "existing" ? (
                    <div className="space-y-1 bg-white p-2.5 border rounded-lg relative">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Пошук клієнта за іменем або телефоном</Label>
                      <div className="relative">
                        <Input placeholder="Почніть вводити ПІБ чи номер..." value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} />
                        {isClientSearching && <Loader2 size={14} className="animate-spin text-blue-500 absolute right-2 top-2.5" />}
                      </div>

                      {searchedClients.length > 0 && (
                        <div className="absolute left-2 right-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-36 overflow-y-auto mt-1 divide-y divide-slate-100 text-left">
                          {searchedClients.map((c) => {
                            const text = `${c.fullName} (${c.phone})`;
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setFormData({ ...formData, clientId: c.id });
                                  clientQuery === text ? null : setClientQuery(text);
                                  setSelectedClientText(text);
                                  setSearchedClients([]);
                                }}
                                className="p-2 hover:bg-slate-50 cursor-pointer text-[11px] font-bold text-slate-700"
                              >
                                <div>{c.fullName}</div>
                                <div className="text-[9px] text-slate-400 font-normal">{c.phone} | {c.email || "немає email"}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 bg-white p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">ПІБ Клієнта *</Label>
                        <Input placeholder="Проць Олександр Володимирович" required={vehicleMode === "new" && clientMode === "new"} value={formData.clientFullName} onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Telephone *</Label>
                          <Input placeholder="+380XXXXXXXXX" required={vehicleMode === "new" && clientMode === "new"} value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Email</Label>
                          <Input type="email" placeholder="client@gmail.com" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ПАРАМЕТРИ ПРИЙОМУ НА СТО */}
            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
              <div className="space-y-1">
                <Label htmlFor="mileage" className="text-slate-800 font-bold flex items-center gap-1">
                  <Milestone size={13} className="text-blue-500" />
                  Поточний пробіг авто при заїзді (км)
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="Наприклад, 140070"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="border-slate-200 font-medium text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-slate-800 font-bold flex items-center gap-1">
                  <User size={13} className="text-blue-500" />
                  Опис проблеми / Скарги клієнта та нотатки
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Заміна масла, стукіт у передній підвісці, діагностика ходової частини..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-slate-200 h-20 min-h-[60px] font-medium text-xs"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 gap-2 sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 text-xs cursor-pointer hover:bg-slate-50 transition px-5"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer shadow-md transition px-6 disabled:opacity-50"
              >
                {loading ? "Збереження..." : orderId ? "Зберегти зміни" : "Створити замовлення-наряд"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}