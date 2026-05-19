"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientService } from "../services/clientService"; // Тільки цей сервіс!
import { ClientDto, CreateClientDto } from "../types/Client";
import { User, Phone, Mail, Save, Loader2, UserPlus, Edit3, AlertCircle } from "lucide-react";

interface UpsertClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: ClientDto | null;
}

export default function UpsertClientModal({ isOpen, onClose, onSuccess, client }: UpsertClientModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 👑 СТЕЙТИ ДЛЯ СЕРВЕРНОЇ ВАЛІДАЦІЇ ВІД .NET API
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isEditMode = !!client;

  useEffect(() => {
    if (isOpen) {
      // Скидаємо помилки при кожному відкритті вікна
      setPhoneError(null);
      setGeneralError(null);

      if (client) {
        setFullName(client.fullName);
        setPhone(client.phone);
        setEmail(client.email || "");
      } else {
        setFullName("");
        setPhone("");
        setEmail("");
      }
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setGeneralError(null);

    if (!fullName.trim() || !phone.trim()) {
      setGeneralError("Будь ласка, заповніть обов'язкові fields: ПІБ та Телефон");
      return;
    }

    try {
      setIsSubmitting(true);
      const dto: CreateClientDto = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      };

      if (isEditMode && client) {
        await clientService.updateClient(client.id, dto);
      } else {
        await clientService.createClient(dto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Помилка збереження даних клієнта:", err);
      
      const responseData = err.response?.data;

      // 👑 РОЗБИРАЄМО RFC 9110 ValidationProblemDetails ВІД .NET
      if (err.response?.status === 400 && responseData?.errors) {
        const validationErrors = responseData.errors;
        
        // Шукаємо помилку конкретно для поля Phone або phone
        const phoneMessage = validationErrors["Phone"] || validationErrors["phone"];
        if (phoneMessage && phoneMessage.length > 0) {
          setPhoneError(phoneMessage[0]); // Витягуємо перше повідомлення з масиву
        } else {
          setGeneralError("Помилка валідації даних. Перевірте введені значення.");
        }
      } else if (err.response?.status === 403) {
        setGeneralError("Дія відхилена: Ця операція доступна тільки для користувачів з роллю Менеджер.");
      } else {
        setGeneralError("Не вдалося зберегти профіль контрагента в базі даних СТО.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[430px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans antialiased">
        
        <DialogHeader className="border-b border-slate-50 pb-3 flex flex-row items-center gap-2 select-none">
          <div className={`p-2 rounded-xl border shrink-0 ${isEditMode ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}>
            {isEditMode ? <Edit3 size={16} /> : <UserPlus size={16} />}
          </div>
          <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
            {isEditMode ? "Редагування профілю контрагента" : "Реєстрація нового клієнта СТО"}
          </DialogTitle>
        </DialogHeader>

        {/* Загальна плашка помилки (якщо впав 403 або системний еррор) */}
        {generalError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[11px] font-bold shadow-sm select-none flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 select-none">
          
          {/* 1. ПІБ */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">ПІБ Власника авто *</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Іванов Іван Іванович"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 text-xs pl-9.5 font-semibold bg-slate-50/40 rounded-xl w-full"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 2. ТЕЛЕФОН З ДИНАМІЧНОЮ СЕРВЕРНОЮ ПОМИЛКОЮ */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Контактний телефон *</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="+380XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError(null); // затираємо помилку, коли користувач почав виправляти номер
                }}
                className={`h-10 text-xs pl-9.5 font-bold bg-slate-50/40 rounded-xl tabular-nums w-full transition-colors ${
                  phoneError ? "border-red-300 focus-visible:ring-red-400 bg-red-50/10" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            
            {/* 👑 КРАСИВИЙ ВИВІД ПОМИЛКИ ВАЛІДАЦІЇ .NET БЕЗ АЛЕРТІВ */}
            {phoneError && (
              <span className="text-[10px] font-bold text-red-600 block pt-1 pl-1 animate-pulse">
                {phoneError}
              </span>
            )}
          </div>

          {/* 3. EMAIL */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Електронна пошта (Опціонально)</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="client@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs pl-9.5 font-semibold bg-slate-50/40 rounded-xl w-full"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 pt-3 border-t border-slate-50 grid grid-cols-2 gap-3 w-full sm:space-x-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Скасувати
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={`h-10 text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer transition flex items-center justify-center gap-1.5 ${
                isEditMode ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Збереження...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>{isEditMode ? "Оновити дані" : "Зареєструвати"}</span>
                </>
              )}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}