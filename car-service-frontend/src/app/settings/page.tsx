"use client";

import { useEffect, useState } from "react";
import { 
  Settings, Clock, Mail, Save, 
  CheckCircle2, Bell, Shield, Info, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  // 1. Стейт для налаштувань (з дефолтними значеннями)
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Стейт інтерфейсу
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 2. Зчитуємо збережені налаштування з localStorage при завантаженні сторінки
  useEffect(() => {
    const savedStart = localStorage.getItem("sto_work_start");
    const savedEnd = localStorage.getItem("sto_work_end");
    const savedEmail = localStorage.getItem("sto_email_notifications");

    if (savedStart) setWorkStart(savedStart);
    if (savedEnd) setWorkEnd(savedEnd);
    if (savedEmail !== null) setEmailNotifications(savedEmail === "true");
  }, []);

  // 3. Функція імітації збереження даних
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);

    setTimeout(() => {
      localStorage.setItem("sto_work_start", workStart);
      localStorage.setItem("sto_work_end", workEnd);
      localStorage.setItem("sto_email_notifications", String(emailNotifications));

      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  return (
    /* ВИПРАВЛЕНО: Замінено max-w-4xl на max-w-full w-full для заповнення всього екрану */
    <div className="space-y-4 font-sans antialiased bg-transparent p-2 sm:p-6 w-full max-w-full select-none">
      
      {/* ВЕРХНЯ ШАПКА НАЛАШТУВАНЬ */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hidden xs:block">
            <Settings size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              Системні налаштування СТО
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-relaxed">
              Конфігурація глобальних параметрів автосервісу, розкладу роботи та автоматичних сповіщень клієнтів
            </p>
          </div>
        </div>
      </div>

      {/* ПЛАШКА УСПІШНОГО ЗБЕРЕЖЕННЯ */}
      {showSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            Конфігурацію автосервісу успешно збережено сховищі системи!
          </div>
        </div>
      )}

      {/* ГОЛОВНА ФОРМА НАЛАШТУВАНЬ */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* БЛОК 1: ГРАФІК РОБОТИ */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600"><Clock size={14} /></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Робочий час сервісу</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Задайте часові рамки робочого дня. Ці параметри автоматично обмежують генерацію сітки доступних годин у календарі записів клієнтів.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-500">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1 text-slate-400">Початок зміни</label>
                  <Input 
                    type="time" 
                    value={workStart} 
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50/50 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1 text-slate-400">Кінець зміни</label>
                  <Input 
                    type="time" 
                    value={workEnd} 
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50/50 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-400 font-medium leading-relaxed">
              <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Зміна цих годин оновить графік замовлень нарядів на головній сторінці без завантаження серверних міграцій.</span>
            </div>
          </div>

          {/* БЛОК 2: АВТОМАТИЗАЦІЯ ТА СПОВІЩЕННЯ */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600"><Bell size={14} /></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Клієнтський сервіс</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Налаштуйте тригери автоматичної комунікації з власниками авто. Система підтримує миттєву відправку нагадувань про візити та статуси замовлень через email, що підвищує лояльність клієнтів та зменшує кількість пропущених записів.
              </p>

              {/* ТОГЛ КНОПКА (ПЕРЕМИКАЧ) EMAIL */}
              <div className="pt-2">
                <div className="flex items-center justify-between bg-slate-50/60 p-3.5 border border-slate-100 rounded-xl transition-colors hover:bg-slate-50">
                  <div className="space-y-0.5 pr-2">
                    <span className="block text-slate-800 text-xs font-black flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" /> Email-сповіщення клієнтів
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium leading-tight">
                      Надсилати статус замовлення та пароль до особистого кабінету водія на пошту
                    </span>
                  </div>
                  
                  <select 
                    value={emailNotifications ? "true" : "false"} 
                    onChange={(e) => setEmailNotifications(e.target.value === "true")}
                    className={`h-8 px-2.5 border rounded-lg font-bold text-xs cursor-pointer outline-none shadow-sm transition ${
                      emailNotifications 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                        : "bg-rose-50 border-rose-200 text-rose-600"
                    }`}
                  >
                    <option value="true">Увімкнено</option>
                    <option value="false">Вимкнено</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-400 font-medium leading-relaxed">
              <Shield size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Усі розсилки здійснюються через захищений SMTP-шлюз Servio CRM за замовчуванням.</span>
            </div>
          </div>

        </div>

        {/* КНОПКА ЗБЕРЕЖЕННЯ КОНФІГУРАЦІЇ */}
        <div className="flex justify-end pt-1">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="h-11 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl cursor-pointer transition flex items-center gap-1.5 active:scale-98"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Збереження конфігурації...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Зберегти налаштування СТО</span>
              </>
            )}
          </Button>
        </div>

      </form>

    </div>
  );
}