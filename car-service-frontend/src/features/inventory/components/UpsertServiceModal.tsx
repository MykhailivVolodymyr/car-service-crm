"use client";

import { useEffect, useState } from "react";
import { servicePriceListService, ServiceDto } from "../services/servicePriceListService";
import { ServiceCategoryDto } from "../types/Services";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Plus, Clipboard, Tag, Loader2, AlertCircle, Coins } from "lucide-react";

interface UpsertServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceId?: number | null; // Переданий ID означає режим редагування (PUT)
}

export default function UpsertServiceModal({ isOpen, onClose, onSuccess, serviceId }: UpsertServiceModalProps) {
  const isEditMode = !!serviceId;

  // Стейти форми відповідно до DTO
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Стейт довідника категорій
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);

  // Режим створення нової категорії авторобіт "на льоту"
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen) return;

    const loadDictionariesAndData = async () => {
      try {
        setLoadingData(true);
        setErrors({});
        
        // Спочатку завжди завантажуємо список категорій для селектора
        const catsData = await servicePriceListService.getAllCategories();
        setCategories(catsData);

        // Якщо у нас редагування — витягуємо дані послуги з бекенду
        if (serviceId) {
          const service = await servicePriceListService.getServiceById(serviceId);
          setName(service.name);
          setDescription(service.description || "");
          setDefaultPrice(service.defaultPrice.toString());
          setCategoryId(service.categoryId.toString());
        } else {
          handleResetFields();
        }
      } catch (err) {
        console.error("Помилка ініціалізації модалки послуг:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDictionariesAndData();
  }, [isOpen, serviceId]);

  const handleResetFields = () => {
    setName("");
    setDescription("");
    setDefaultPrice("");
    setCategoryId("");
    setNewCategoryName("");
    setIsAddingCategory(false);
    setErrors({});
  };

  // Швидке додавання категорії послуг (наприклад, "Діагностика") прямо з вікна
  const handleQuickCategoryAdd = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await servicePriceListService.createCategory({ name: newCategoryName.trim() });
      setCategories(prev => [...prev, newCat]);
      setCategoryId(newCat.id.toString());
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      alert("Не вдалося створити нову категорію робіт.");
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key && errors[key]?.length > 0 ? errors[key][0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Клієнтська валідація на порожні значення
    if (!name.trim() || !defaultPrice || !categoryId) {
      setErrors({ _form: ["Будь ласка, заповніть назву, базову ціну послуги та оберіть категорію."] });
      return;
    }

    if (Number(defaultPrice) < 0) {
      setErrors({ _form: ["Вартість технологічної операції не може бути від'ємною."] });
      return;
    }

    try {
      setSubmitting(true);
      const selectedCatName = categories.find(c => c.id === Number(categoryId))?.name || null;

      if (isEditMode) {
        // Мапимо на UpdateServiceDto (Id всередині об'єкта)
        const updateDto = {
          id: serviceId!,
          name: name.trim(),
          description: description.trim() || null,
          defaultPrice: Number(defaultPrice),
          categoryId: Number(categoryId)
        };
        await servicePriceListService.updateService(updateDto);
      } else {
        // Мапимо на CreateServiceDto
        const createDto = {
          name: name.trim(),
          description: description.trim() || null,
          defaultPrice: Number(defaultPrice),
          categoryId: Number(categoryId),
          categoryName: selectedCatName
        };
        await servicePriceListService.createService(createDto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ _form: [err.response?.data?.title || "Помилка при збереженні послуги в прейскурант."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[520px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans max-h-[90vh] overflow-y-auto antialiased">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Wrench className="text-blue-600" size={18} />
            <span>{isEditMode ? "Редагування операції прайсу" : "Додавання нової автопослуги СТО"}</span>
          </DialogTitle>
        </DialogHeader>

        {errors._form && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-start gap-2 text-xs font-bold shadow-sm">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>{errors._form.map((msg, i) => <p key={i}>{msg}</p>)}</div>
          </div>
        )}

        {loadingData ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Отримання прайсу...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-bold text-slate-600 select-none">
            
            {/* Назва послуги */}
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("name") ? "text-rose-500" : "text-slate-400"}`}>Назва технологічної операції *</Label>
              <div className="relative">
                <Clipboard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Комп'ютерна діагностика блоків ECU" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50" />
              </div>
              {getFieldError("name") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("name")}</span>}
            </div>

            {/* Базова вартість / Норма-година */}
            <div>
              <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Базова вартість роботи (грн) *</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} placeholder="450" className="h-10 pl-9 rounded-xl font-black bg-slate-50/50 text-blue-600" />
              </div>
            </div>

            {/* СЕЛЕКТОР КАТЕГОРІЇ АВТОРОБІТ З ШВИДКИМ ДОДАВАННЯМ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider">Категорія / Технологічний розділ *</Label>
                <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer">
                  <Plus size={12} /> {isAddingCategory ? "Обрати розділ" : "Створити розділ"}
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-1.5 bg-blue-50/40 p-2 border border-blue-100/60 rounded-xl animate-in fade-in duration-150">
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Назва розділу (напр. Комп'ютерна діагностика)" className="h-9 bg-white text-xs font-medium rounded-lg" />
                  <Button type="button" onClick={handleQuickCategoryAdd} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg px-3">Зберегти</Button>
                </div>
              ) : (
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 font-medium cursor-pointer outline-none focus:border-blue-500">
                    <option value="">Оберіть категорію робіт</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Опис послуги */}
            <div>
              <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Технічний опис / Примітки до операції</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Включає зчитування та скидання помилок усіх електронних систем автомобіля за допомогою сканера OBD2..." className="min-h-[80px] rounded-xl font-medium bg-slate-50/50 text-slate-600 text-xs p-3 focus-visible:ring-0 resize-none" />
            </div>

            {/* Нижні Кнопки */}
            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer">
                {submitting ? "Збереження..." : isEditMode ? "Зберегти зміни" : "Додати в прайс"}
              </Button>
            </DialogFooter>

          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}