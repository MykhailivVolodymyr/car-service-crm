"use client";

import { useEffect, useState } from "react";
import { masterService } from "../services/masterService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Mail, Phone, Loader2, AlertCircle, CheckCircle2, Key, Copy, Check } from "lucide-react";

interface UpsertMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterId?: number | null;
}

export default function UpsertMasterModal({ isOpen, onClose, onSuccess, masterId }: UpsertMasterModalProps) {
  const isEditMode = !!masterId;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Стейт для демонстрації створеного пароля
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen) return;

    const loadMasterData = async () => {
      try {
        setCreatedCredentials(null);
        setIsCopied(false);
        setErrors({});

        if (masterId) {
          setLoadingData(true);
          const master = await masterService.getMasterById(masterId);
          setFullName(master.fullName);
          setEmail(master.email);
          setPhone(master.phone || "");
          setIsActive(master.isActive);
        } else {
          setFullName("");
          setEmail("");
          setPhone("");
          setIsActive(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    loadMasterData();
  }, [isOpen, masterId]);

  const handleCopyPassword = () => {
    if (!createdCredentials) return;
    navigator.clipboard.writeText(createdCredentials.pass);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Хелпер для витягування точкових помилок з урахуванням регістру з C# (напр. Phone чи Email)
  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key && errors[key]?.length > 0 ? errors[key][0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!fullName.trim() || !email.trim()) {
      setErrors({ _form: ["Будь ласка, заповніть ПІБ та Email майстра."] });
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode) {
        await masterService.updateMaster({
          id: masterId!,
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          roleId: 2, // ID Ролі "Майстер"
          isActive
        });
        onSuccess();
        onClose();
      } else {
        const result = await masterService.createMaster({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null
        });
        
        setCreatedCredentials({ email: result.email, pass: result.password });
        onSuccess();
      }
    } catch (err: any) {
      console.error("Помилка сервера при реєстрації:", err);
      
      // Ідеальний мапінг RFC 9110 валідації 400 Bad Request
      if (err.response && err.response.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ _form: [err.response?.data?.message || "Цей Email вже використовується в системі СТО."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[460px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans max-h-[90vh] overflow-y-auto antialiased">
        
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <UserPlus className="text-blue-600" size={18} />
            <span>{isEditMode ? "Редагування профілю майстра" : "Реєстрація нового майстра СТО"}</span>
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
        ) : createdCredentials ? (
          /* ЕКРАН ДЕМОНСТРАЦІЇ ПАРОЛЯ ПІСЛЯ УСПІШНОГО СТВОРЕННЯ */
          <div className="space-y-4 py-2 select-none animate-in fade-in duration-200 text-xs font-bold text-slate-600">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-800">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-black text-sm tracking-tight">Майстра успішно зареєстровано!</p>
                <p className="font-medium text-[11px] text-emerald-700/90 mt-0.5">Доступи автоматично надіслано на вказаний Email працівника.</p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 space-y-3 font-medium">
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Логін (Email)</span>
                <div className="text-slate-800 font-mono font-bold text-xs mt-0.5">{createdCredentials.email}</div>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Згенерований пароль</span>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2 mt-1 shadow-sm">
                  <div className="font-mono text-blue-600 font-black text-sm tracking-wide flex items-center gap-1.5">
                    <Key size={13} className="text-blue-400" />
                    <span>{createdCredentials.pass}</span>
                  </div>
                  <button type="button" onClick={handleCopyPassword} className="p-1.5 hover:bg-slate-50 rounded-md transition text-slate-500 hover:text-slate-700 cursor-pointer">
                    {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="button" onClick={onClose} className="h-10 w-full rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-950 text-white mt-2">
              Закрити вікно
            </Button>
          </div>
        ) : (
          /* СТАНДАРТНА ФОРМА ЗАПОВНЕННЯ */
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-bold text-slate-600 select-none">
            {/* Поле ПІБ */}
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("fullName") ? "text-rose-500" : "text-slate-400"}`}>Прізвище та Ім'я майстра *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ковальчук Андрій" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50" />
              </div>
              {getFieldError("fullName") && <span className="text-[10px] text-rose-500 font-semibold mt-1 block pl-1">{getFieldError("fullName")}</span>}
            </div>

            {/* Поле Email */}
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("email") ? "text-rose-500" : "text-slate-400"}`}>Електронна пошта *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input type="email" disabled={isEditMode} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kovalchuk@gmail.com" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50 disabled:opacity-50 font-mono" />
              </div>
              {getFieldError("email") && <span className="text-[10px] text-rose-500 font-semibold mt-1 block pl-1">{getFieldError("email")}</span>}
              {!isEditMode && !getFieldError("email") && <p className="text-[9px] text-slate-400 font-normal pl-1 mt-0.5">Використовується як логін для входу в систему</p>}
            </div>

            {/* ДОДАНО: Поле Телефону з відображенням помилки валідації .NET */}
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("phone") ? "text-rose-500" : "text-slate-400"}`}>Номер телефону</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50 font-mono" />
              </div>
              {getFieldError("phone") && (
                <span className="text-[10px] text-rose-500 font-black mt-1 block pl-1 bg-rose-50/50 border border-rose-100/40 p-1.5 rounded-lg animate-in fade-in duration-150">
                  ⚠️ {getFieldError("phone")}
                </span>
              )}
            </div>

            {isEditMode && (
              <div className="flex items-center justify-between bg-slate-50/60 p-3 border border-slate-100 rounded-xl">
                <div>
                  <span className="block text-slate-800 text-xs font-black">Доступ до нарядів СТО</span>
                  <span className="block text-[10px] text-slate-400 font-medium">Визначає, чи може майстер брати авто в роботу</span>
                </div>
                <select value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")} className="h-8 px-2 border border-slate-200 rounded-lg bg-white font-bold text-xs cursor-pointer outline-none">
                  <option value="true" className="text-emerald-600">Активний</option>
                  <option value="false" className="text-rose-600">Заблокований</option>
                </select>
              </div>
            )}

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer">
                {submitting ? "Збереження..." : isEditMode ? "Зберегти зміни" : "Зареєструвати майстра"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}