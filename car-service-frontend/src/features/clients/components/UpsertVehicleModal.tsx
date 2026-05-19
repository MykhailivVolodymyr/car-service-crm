"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientService, CreateVehicleRequestDto, VehicleBrandDto, VehicleModelDto } from "../services/clientService";
import { VehicleDto } from "../types/ClientDetails";
import { ClientDto } from "../types/Client";
import { Car, CreditCard, Key, Calendar, Save, Loader2, Plus, Edit, Search } from "lucide-react";

interface UpsertVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: ClientDto;
  vehicle: VehicleDto | null;
}

export default function UpsertVehicleModal({ isOpen, onClose, onSuccess, client, vehicle }: UpsertVehicleModalProps) {
  // --- Довідник Брендів ---
  const [brandSearch, setBrandSearch] = useState("");
  const [brandsResult, setBrandsResult] = useState<VehicleBrandDto[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrandDto | null>(null);
  const [isSearchingBrands, setIsSearchingBrands] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // --- Довідник Моделей ---
  const [modelSearch, setModelSearch] = useState("");
  const [modelsResult, setModelsResult] = useState<VehicleModelDto[]>([]);
  const [selectedModel, setSelectedModel] = useState<VehicleModelDto | null>(null);
  const [isSearchingModels, setIsSearchingModels] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  // --- Технічні дані авто ---
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!vehicle;
  const brandRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Закриття випадаючих списків при кліку назовні
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Підтягуємо існуючі дані при редагуванні
  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setLicensePlate(vehicle.licensePlate);
        setVin(vehicle.vin);
        setYear(vehicle.year);
        
        setBrandSearch(vehicle.brandName);
        setSelectedBrand({ id: 0, name: vehicle.brandName }); // Тимчасовий об'єкт для режиму редагування
        
        setModelSearch(vehicle.modelName);
        setSelectedModel({
          id: vehicle.modelId,
          brandId: 0,
          brandName: vehicle.brandName,
          name: vehicle.modelName
        });
      } else {
        setLicensePlate("");
        setVin("");
        setYear(2018);
        setBrandSearch("");
        setSelectedBrand(null);
        setBrandsResult([]);
        setModelSearch("");
        setSelectedModel(null);
        setModelsResult([]);
      }
    }
  }, [isOpen, vehicle]);

  // 🔍 1. Живий пошук БРЕНДІВ (Debounce 300ms)
  useEffect(() => {
    if (!isOpen || isEditMode || brandSearch.trim() === "" || selectedBrand?.name === brandSearch) {
      if (brandSearch === "") setBrandsResult([]);
      return;
    }

    setIsSearchingBrands(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await clientService.searchBrands(brandSearch);
        setBrandsResult(data);
        setIsBrandDropdownOpen(data.length > 0);
      } catch (err) {
        console.error("Помилка пошуку брендів:", err);
      } finally {
        setIsSearchingBrands(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [brandSearch, isOpen, isEditMode, selectedBrand]);

  // 🔍 2. Живий пошук МОДЕЛЕЙ (Debounce 300ms)
  useEffect(() => {
    if (!isOpen || isEditMode || modelSearch.trim() === "" || selectedModel?.name === modelSearch) {
      if (modelSearch === "") setModelsResult([]);
      return;
    }

    setIsSearchingModels(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await clientService.searchModels(modelSearch);
        
        // Каскадна фільтрація: якщо бренд вибрано, показуємо тільки моделі цього бренду
        const filteredModels = selectedBrand && selectedBrand.id !== 0
          ? data.filter(m => m.brandId === selectedBrand.id || m.brandName.toLowerCase() === selectedBrand.name.toLowerCase())
          : data;

        setModelsResult(filteredModels);
        setIsModelDropdownOpen(filteredModels.length > 0);
      } catch (err) {
        console.error("Помилка пошуку моделей:", err);
      } finally {
        setIsSearchingModels(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [modelSearch, isOpen, isEditMode, selectedModel, selectedBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !selectedModel || !licensePlate.trim() || !vin.trim()) {
      alert("Будь ласка, заповніть усі обов'язкові поля та виберіть марку й модель з довідників!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dto: CreateVehicleRequestDto = {
        clientId: client.id,
        clientFullName: client.fullName,
        clientPhone: client.phone,
        clientEmail: client.email || null,
        modelId: selectedModel.id,
        brandName: selectedBrand.name,
        modelName: selectedModel.name,
        vin: vin.trim().toUpperCase(),
        licensePlate: licensePlate.trim().toUpperCase(),
        year: Number(year),
      };

      if (isEditMode && vehicle) {
        await clientService.updateVehicle(vehicle.id, dto);
      } else {
        await clientService.createVehicle(dto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Помилка збереження ТЗ:", err);
      alert(err.response?.status === 403 ? "Немає прав доступу Менеджера" : "Не вдалося зберегти автомобіль.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans antialiased">
        <DialogHeader className="border-b border-slate-50 pb-3 flex flex-row items-center gap-2 select-none">
          <div className={`p-2 rounded-xl border shrink-0 ${isEditMode ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
            {isEditMode ? <Edit size={16} /> : <Plus size={16} />}
          </div>
          <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
            {isEditMode ? "Редагування транспортного засобу" : "Прив'язка нового авто до гаража"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {/* ПОЛЕ 1: Пошук Бренду / Марки */}
          <div className="space-y-1 relative" ref={brandRef}>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Марка автомобіля *</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Пошук марки (напр. BMW, Opel, Toyota)..." 
                value={brandSearch} 
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  if (selectedBrand) {
                    setSelectedBrand(null);
                    setSelectedModel(null); // Якщо скидають бренд — скидаємо й модель
                    setModelSearch("");
                  }
                }} 
                className="h-10 text-xs font-semibold rounded-xl bg-slate-50/40 pl-9 pr-8"
                disabled={isSubmitting || isEditMode}
              />
              {isSearchingBrands && (
                <Loader2 size={12} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
              )}
            </div>

            {isBrandDropdownOpen && brandsResult.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto z-50 text-xs font-semibold text-slate-700 divide-y divide-slate-50 select-none">
                {brandsResult.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b);
                      setBrandSearch(b.name);
                      setIsBrandDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="text-slate-900 font-bold">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ПОЛЕ 2: Пошук Моделі (Доступно тільки ПІСЛЯ вибору бренду) */}
          <div className="space-y-1 relative" ref={modelRef}>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Модель авто *</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder={selectedBrand ? "Пошук моделі (напр. Astra, X5, Golf)..." : "Спочатку виберіть марку автомобіля..."} 
                value={modelSearch} 
                onChange={(e) => {
                  setModelSearch(e.target.value);
                  if (selectedModel) setSelectedModel(null);
                }} 
                className="h-10 text-xs font-semibold rounded-xl bg-slate-50/40 pl-9 pr-8"
                disabled={isSubmitting || !selectedBrand || isEditMode}
              />
              {isSearchingModels && (
                <Loader2 size={12} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
              )}
            </div>

            {isModelDropdownOpen && modelsResult.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto z-50 text-xs font-semibold text-slate-700 divide-y divide-slate-50 select-none">
                {modelsResult.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      setModelSearch(m.name);
                      setIsModelDropdownOpen(false);
                      // Якщо бренд не був вибраний через ID (наприклад при редагуванні), підв'язуємо його
                      if (!selectedBrand || selectedBrand.id === 0) {
                        setSelectedBrand({ id: m.brandId, name: m.brandName });
                        setBrandSearch(m.brandName);
                      }
                    }}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="text-slate-900 font-bold">{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Марка: {m.brandName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Технічні блоки номерів та року */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Держномер *</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="BC1234AI" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} className="h-10 text-xs pl-9 font-black bg-slate-50/40 rounded-xl uppercase tracking-wide" disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Рік випуску *</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type="number" min={1950} max={2027} value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-10 text-xs pl-9 font-bold bg-slate-50/40 rounded-xl tabular-nums" disabled={isSubmitting} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">VIN-код автомобіля *</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="17-значний номер кузова..." value={vin} onChange={(e) => setVin(e.target.value)} className="h-10 text-xs pl-9 font-mono font-bold bg-slate-50/40 rounded-xl uppercase tracking-wider tabular-nums" disabled={isSubmitting} maxLength={17} />
            </div>
          </div>

          <DialogFooter className="mt-6 pt-3 border-t border-slate-50 grid grid-cols-2 gap-3 w-full sm:space-x-0 select-none">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-10 text-xs font-bold rounded-xl text-slate-600">Скасувати</Button>
            <Button type="submit" disabled={isSubmitting || !selectedBrand || !selectedModel} className={`h-10 text-xs font-bold text-white rounded-xl shadow-sm ${isEditMode ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}>
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span className="ml-1.5">{isEditMode ? "Оновити дані" : "Додати в гараж"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}