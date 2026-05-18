"use client";

import { useEffect, useState } from "react";
import { masterService } from "../services/masterService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, LayoutGrid, Loader2, AlertCircle } from "lucide-react";

interface UpsertWorkPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  postId?: number | null;
}

export default function UpsertWorkPostModal({ isOpen, onClose, onSuccess, postId }: UpsertWorkPostModalProps) {
  const isEditMode = !!postId;

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen) return;

    const loadPostData = async () => {
      try {
        setErrors({});
        if (postId) {
          setLoadingData(true);
          const post = await masterService.getWorkPostById(postId);
          setName(post.name);
          setIsActive(post.isActive);
        } else {
          setName("");
          setIsActive(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    loadPostData();
  }, [isOpen, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ _form: ["Будь ласка, вкажіть назву робочого поста СТО."] });
      return;
    }

    try {
      setSubmitting(true);
      const dto = { name: name.trim(), isActive };

      if (isEditMode) {
        await masterService.updateWorkPost(postId!, dto);
      } else {
        await masterService.createWorkPost(dto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response && err.response.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ _form: ["Помилка при збереженні робочого поста."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const key = Object.keys(errors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    return key && errors[key]?.length > 0 ? errors[key][0] : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[420px] w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-6 font-sans max-h-[90vh] overflow-y-auto antialiased">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Wrench className="text-blue-600" size={18} />
            <span>{isEditMode ? "Редагування робочого поста" : "Додавання робочого поста СТО"}</span>
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
            <div>
              <Label className={`block text-[10px] uppercase tracking-wider mb-1 ${getFieldError("name") ? "text-rose-500" : "text-slate-400"}`}>Назва / Номер поста *</Label>
              <div className="relative">
                <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Пост №1 (Діагностика / Електрика)" className="h-10 pl-9 rounded-xl font-medium bg-slate-50/50" />
              </div>
              {getFieldError("name") && <span className="text-[10px] text-rose-500 font-semibold mt-1 block pl-1">{getFieldError("name")}</span>}
            </div>

            <div className="flex items-center justify-between bg-slate-50/60 p-3 border border-slate-100 rounded-xl">
              <div>
                <span className="block text-slate-800 text-xs font-black">Статус працездатності</span>
                <span className="block text-[10px] text-slate-400 font-medium">Визначає доступність боксу для планування записів</span>
              </div>
              <select value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")} className="h-8 px-2 border border-slate-200 rounded-lg bg-white font-bold text-xs cursor-pointer outline-none">
                <option value="true" className="text-emerald-600">Активний</option>
                <option value="false" className="text-rose-600">Заблокований</option>
              </select>
            </div>

            <DialogFooter className="mt-6 pt-3 border-t border-slate-100 gap-2 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 cursor-pointer">
                Скасувати
              </Button>
              <Button type="submit" disabled={submitting} className="h-10 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer">
                {submitting ? "Збереження..." : isEditMode ? "Зберегти зміни" : "Створити пост"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}