"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  isDeleting: boolean;
  error: string | null; // ДОДАНО: Стейт помилки від API
}

export default function DeleteClientDialog({ isOpen, onClose, onConfirm, clientName, isDeleting, error }: DeleteClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 font-sans antialiased">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 select-none">
          {/* Міняємо колір іконки на помаранчевий/червоний залежно від наявності помилки */}
          <div className={`p-3.5 rounded-full border shadow-sm ${
            error ? "bg-red-50 text-red-600 border-red-100" : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
          }`}>
            <AlertTriangle size={26} className="stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
              Вилучення контрагента з бази CRM
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed pt-1.5 px-1">
              Ви дійсно впевнені, що хочете остаточно видалити клієнта <strong className="text-slate-800 font-bold">&quot;{clientName}&quot;</strong>? 
              Ця дія анулює профіль автовласника. Видалення дозволено лише ролі <span className="text-rose-600 font-bold">Менеджер</span>.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 👑 ДОДАНО: КРАСИВА ПЛАНШЕТКА ПОМИЛКИ ЗАМІСТЬ ALERT */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-100/70 text-red-700 rounded-xl text-[11px] font-bold leading-normal shadow-sm select-none">
            {error}
          </div>
        )}

        <DialogFooter className="mt-6 grid grid-cols-2 gap-3 w-full sm:space-x-0 select-none">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            {error ? "Закрити" : "Скасувати"}
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            disabled={isDeleting || !!error} // Блокуємо кнопку, якщо є помилка зв'язку
            className={`h-10 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 ${
              error ? "bg-slate-300 border-slate-300 cursor-not-allowed text-slate-500 shadow-none" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Вилучення...</span>
              </>
            ) : (
              <span>Видалити клієнта</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}