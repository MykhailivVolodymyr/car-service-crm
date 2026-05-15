import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/40 p-4 font-sans text-center">
      <div className="max-w-md p-8 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 rounded-2xl">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Сторінку не знайдено</h2>
        <p className="text-slate-600 mb-6 font-medium">
          Такої сторінки в нашій CRM немає. Перевірте правильність введеної адреси.
        </p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium px-6 cursor-pointer">
            Повернутися на головну
          </Button>
        </Link>
      </div>
    </div>
  );
}