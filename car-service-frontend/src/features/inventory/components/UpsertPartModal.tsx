"use client";

import { useEffect, useState } from "react";
import { partService } from "../services/partService";
import { PartDto, PartCategoryDto } from "../types/Parts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Clipboard, Tag, Factory, Loader2, AlertCircle } from "lucide-react";

interface UpsertPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partId?: number | null; // Якщо передано ID — режим PUT, якщо null — режим POST
}

export default function UpsertPartModal({ isOpen, onClose, onSuccess, partId }: UpsertPartModalProps) {
  const isEditMode = !!partId;

  // Стейт полів форми (CreatePartDto)
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");

  // Списки для випадаючих меню
  const [categories, setCategories] = useState<PartCategoryDto[]>([]);
  const [manufacturers, setManufacturers] = useState<{ id: number; name: string }[]>([]);

  // Режими швидкого створення категорії/виробника "на льоту"
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [isAddingManufacturer, setIsAddingManufacturer] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Завантаження довідників та даних для редагування
  useEffect(() => {
    if (!isOpen) return;

    const loadDictionariesAndData = async () => {
      try {
        setLoadingData(true);
        setErrors({});
        
        const [catsData, mfrsData] = await Promise.all([
          partService.getAllCategories(),
          partService.getAllManufacturers()
        ]);
        setCategories(catsData);
        setManufacturers(mfrsData);

        // Якщо це режим редагування — стягуємо картку запчастини з бекенду
        if (partId) {
          const part = await partService.getPartById(partId);
          setName(part.name);
          setSku(part.sku || "");
          setQuantity(part.quantity.toString());
          setPurchasePrice(part.purchasePrice.toString());
          setSellingPrice(part.sellingPrice.toString());
          setCategoryId(part.categoryId.toString());
          setManufacturerId(part.manufacturerId.toString());
        } else {
          handleResetFields();
        }
      } catch (err) {
        console.error("Помилка завантаження даних модалки:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadDictionariesAndData();
  }, [isOpen, partId]);

  const handleResetFields = () => {
    setName(""); setSku(""); setQuantity("0"); setPurchasePrice(""); setSellingPrice("");
    setCategoryId(""); setManufacturerId(""); setNewCategoryName(""); setNewManufacturerName("");
    setIsAddingCategory(false); setIsAddingManufacturer(false); setErrors({});
  };

  // Швидке додавання нової категорії матеріалів
  const handleQuickCategoryAdd = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await partService.createCategory({ name: newCategoryName.trim() });
      setCategories(prev => [...prev, newCat]);
      setCategoryId(newCat.id.toString());
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      alert("Не вдалося створити категорію.");
    }
  };

  // Швидке додавання нового виробника
  const handleQuickManufacturerAdd = async () => {
    if (!newManufacturerName.trim()) return;
    try {
      const newMfr = await partService.createManufacturer({ name: newManufacturerName.trim() });
      setManufacturers(prev => [...prev, newMfr]);
      setManufacturerId(newMfr.id.toString());
      setNewManufacturerName("");
      setIsAddingManufacturer(false);
    } catch (err) {
      alert("Не вдалося створити виробника.");
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key && errors[key]?.length > 0 ? errors[key][0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name || !purchasePrice || !sellingPrice || !categoryId || !manufacturerId) {
      setErrors({ _form: ["Будь ласка, заповніть усі обов'язкові поля картки товару."] });
      return;
    }

    try {
      setSubmitting(true);

      const selectedCatName = categories.find(c => c.id === Number(categoryId))?.name || null;
      const selectedMfrName = manufacturers.find(m => m.id === Number(manufacturerId))?.name || null;

      const dto = {
        name,
        sku: sku.trim() || null,
        quantity: Number(quantity || 0),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        categoryId: Number(categoryId),
        categoryName: selectedCatName,
        manufacturerId: Number(manufacturerId),
        manufacturerName: selectedMfrName
      };

      if (isEditMode) {
        await partService.updatePart(partId!, dto);
      } else {
        await partService.createPart(dto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ _form: [err.response?.data?.title || "Помилка при збереженні запчастини на склад."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[580px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans max-h-[90vh] overflow-y-auto antialiased">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Package className="text-blue-600" size={18} />
            <span>{isEditMode ? "Редагування номенклатурної картки" : "Прийняття товару на склад СТО"}</span>
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
            <span className="text-[10px] font-black uppercase tracking-widest">Зчитування даних...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-bold text-slate-600 select-none">
            
            {/* Назва запчастини */}
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("name") ? "text-rose-500" : "text-slate-400"}`}>Назва автозапчастини *</Label>
              <div className="relative">
                <Clipboard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Фільтр масляний 1.6 ТDI" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50" />
              </div>
              {getFieldError("name") && <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{getFieldError("name")}</span>}
            </div>

            {/* Артикул та Початкова Кількість */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Артикул / Код SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="OP-541/2" className="h-10 rounded-xl font-mono bg-slate-50/50 uppercase" />
              </div>
              <div>
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Початкова кількість (шт) *</Label>
                <Input type="number" disabled={isEditMode} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="h-10 rounded-xl font-bold bg-slate-50/50 disabled:opacity-50" />
                {isEditMode && <span className="text-[9px] text-slate-400 font-normal mt-0.5 block pl-1">Коригується кнопками (+/-) у таблиці</span>}
              </div>
            </div>

            {/* Ціни закупівлі та продажу */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-dashed border-slate-100 py-3">
              <div>
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Ціна закупівлі (грн) *</Label>
                <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="250" className="h-10 rounded-xl font-bold bg-slate-50/50 text-slate-500" />
              </div>
              <div>
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Ціна продажу клієнту (грн) *</Label>
                <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="400" className="h-10 rounded-xl font-black bg-slate-50/50 text-blue-600" />
              </div>
            </div>

            {/* СЕЛЕКТОР КАТЕГОРІЇ З ШВИДКИМ ДОДАВАННЯМ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider">Категорія запчастин *</Label>
                <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer">
                  <Plus size={12} /> {isAddingCategory ? "Обрати зі списку" : "Створити категорію"}
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-1.5 bg-blue-50/40 p-2 border border-blue-100/60 rounded-xl animate-in fade-in duration-200">
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Назва нової категорії (напр. Фільтри)" className="h-9 bg-white text-xs font-medium rounded-lg" />
                  <Button type="button" onClick={handleQuickCategoryAdd} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg px-3">Зберегти</Button>
                </div>
              ) : (
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 font-medium cursor-pointer outline-none focus:border-blue-500">
                    <option value="">Оберіть категорію</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* СЕЛЕКТОР ВИРОБНИКА З ШВИДКИМ ДОДАВАННЯМ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="block text-[10px] text-slate-400 uppercase tracking-wider">Виробник / Бренд *</Label>
                <button type="button" onClick={() => setIsAddingManufacturer(!isAddingManufacturer)} className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer">
                  <Plus size={12} /> {isAddingManufacturer ? "Обрати зі списку" : "Створити виробника"}
                </button>
              </div>

              {isAddingManufacturer ? (
                <div className="flex gap-1.5 bg-blue-50/40 p-2 border border-blue-100/60 rounded-xl animate-in fade-in duration-200">
                  <Input value={newManufacturerName} onChange={(e) => setNewManufacturerName(e.target.value)} placeholder="Назва бренду (напр. Bosch)" className="h-9 bg-white text-xs font-medium rounded-lg" />
                  <Button type="button" onClick={handleQuickManufacturerAdd} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg px-3">Зберегти</Button>
                </div>
              ) : (
                <div className="relative">
                  <Factory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)} className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700 font-medium cursor-pointer outline-none focus:border-blue-500">
                    <option value="">Оберіть виробника</option>
                    {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* НИЖНЯ ПАНЕЛЬ */}
            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-50">
                {submitting ? "Збереження..." : isEditMode ? "Зберегти зміни" : "Оприбуткувати"}
              </Button>
            </DialogFooter>

          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}