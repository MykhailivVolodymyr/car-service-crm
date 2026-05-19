"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2, Phone, Mail, Clock, HelpCircle, CheckCircle2 } from "lucide-react";

export default function FeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("suggestion");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Імітація відправки на фронті без бекенду
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setIsSending(true);

    // Імітуємо затримку сервера в 1 секунду
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      // Очищаємо поля форми
      setSubject("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 w-full max-w-full relative">
      
      {/* Шапка модуля */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/10">
            <MessageSquare size={15} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">Зворотній зв'язок</h1>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">Зв'язок із технічною підтримкою розробників CRM</span>
          </div>
        </div>
      </div>

      {/* Головна двокомпонентна сітка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* БЛОК 1: Форма відправки подій (займає 2 колонки з 3) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[420px]">
          
          {isSuccess ? (
            // Екран успіху після надсилання
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 select-none animate-in fade-in zoom-in duration-200">
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                <CheckCircle2 size={24} className="stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Повідомлення успішно надіслано!</h3>
              <p className="text-[11px] text-slate-400 max-w-[280px] font-medium leading-relaxed">
                Дякуємо за звернення. Розробники CRM розглянуть ваш запит найближчим часом.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-4 mt-2 transition-all cursor-pointer shadow-sm"
              >
                Написати ще раз
              </Button>
            </div>
          ) : (
            // Сама форма звернення
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400 mb-1">Надіслати звернення</h2>
                
                {/* Вибір типу звернення */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Тип запиту</label>
                  <Select onValueChange={setType} defaultValue="suggestion">
                    <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 text-xs font-bold text-slate-600 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Оберіть тип запиту" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-sans text-xs">
                      <SelectItem value="suggestion" className="cursor-pointer font-semibold">💡 Пропозиція щодо покращення</SelectItem>
                      <SelectItem value="bug" className="cursor-pointer font-semibold">🐛 Повідомити про помилку (Баг)</SelectItem>
                      <SelectItem value="question" className="cursor-pointer font-semibold">❓ Запитання по функціоналу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Тема повідомлення */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Тема</label>
                  <Input 
                    type="text" 
                    placeholder="Коротко опишіть суть запиту..." 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-9 rounded-xl border-slate-200 text-xs font-bold text-slate-600 focus:border-blue-500 transition-colors placeholder:text-slate-400 placeholder:font-normal w-full"
                  />
                </div>

                {/* Текст повідомлення */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Повідомлення</label>
                  <Textarea 
                    placeholder="Детально опишіть вашу пропозицію або помилку, яка виникла під час роботи..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="rounded-xl border-slate-200 text-xs font-bold text-slate-600 focus:border-blue-500 transition-colors placeholder:text-slate-400 placeholder:font-normal w-full resize-none min-h-[110px]"
                  />
                </div>
              </div>

              {/* Кнопка відправки з лоадером */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSending || !message}
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-5 gap-1.5 shrink-0 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                >
                  {isSending ? (
                    <Loader2 size={13} className="animate-spin text-white" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>{isSending ? "Надсилання..." : "Надіслати запит"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* БЛОК 2: Контакти техпідтримки (займає 1 колонку з 3) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[420px] justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider text-slate-400">Прямі контакти</h2>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Якщо у вас виникли екстрені проблеми з доступом до бази даних СТО або сервером системи, зв'яжіться з нами напряму:
            </p>

            <div className="space-y-3 pt-2">
              {/* Телефон */}
              <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Телефон підтримки</span>
                  <span className="text-xs font-black text-slate-900 block tabular-nums mt-1">+38 (066) 087-67-95</span>
                </div>
              </div>

              {/* Електронна пошта */}
              <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">E-mail розробників</span>
                  <span className="text-xs font-black text-slate-900 block truncate mt-1">support@servio-crm.com</span>
                </div>
              </div>

              {/* Години роботи */}
              <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Графік обробки запитів</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1">Пн–Пт: 09:00 – 18:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Корисна плашка-нотатка внизу */}
          <div className="bg-blue-50/40 border border-blue-100/40 rounded-xl p-3.5 flex gap-2.5 items-start mt-4">
            <HelpCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Усі технічні логи помилок вашого автосервісу зберігаються локально. При баг-репорті опис буде автоматично прикріплено до вашого тікету.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}