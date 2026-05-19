"use client";

import { useState } from "react";
import AnalyticsFilter from "@/features/analytics/components/AnalyticsFilter";
import GeneralStats from "@/features/analytics/components/GeneralStats";
import DailyActivityChart from "@/features/analytics/components/DailyActivityChart";
import HourlyLoadChart from "@/features/analytics/components/HourlyLoadChart";
import TopServicesList from "@/features/analytics/components/TopServicesList";
import TopVehiclesList from "@/features/analytics/components/TopVehiclesList";
import TopClientsList from "@/features/analytics/components/TopClientsList";
import { analyticsService } from "@/features/analytics/services/analyticsService"; // Твій сервіс
import { exportToExcel } from "@/utils/excelExport"; // 👑 АБО вкажи свій правильний шлях до функції exportToExcel
import { AnalyticsRequestDto } from "@/features/analytics/types/Analytics";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();
  const [params, setParams] = useState<AnalyticsRequestDto>({ periodType: "month" });
  const [isExporting, setIsExporting] = useState(false);

  // 👑 КЛІЄНТСЬКА ГЕНЕРАЦІЯ EXCEL ЗВІТУ З КРАСИВИМ МАПІНГОМ
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Стягуємо поточні дані з бекенду на основі вибраного в фільтрі періоду
      const [general, services, vehicles, clients] = await Promise.all([
        analyticsService.getGeneral(params),
        analyticsService.getTopServices(params),
        analyticsService.getTopVehicles(params),
        analyticsService.getTopClients(params),
      ]);

      // Формуємо плоский масив даних для Excel із зрозумілими українськими колонками
      const exportData: any[] = [];

      // 1. Секція: Основні показники СТО
      exportData.push({ "Категорія аналітики": "ОСНОВНІ ПОКАЗНИКИ СТО", "Назва / Послуга": "", "Додаткова інформація": "", "Значення / Кількість": "" });
      exportData.push({ "Категорія аналітики": "Загальний фінансовий оборот", "Назва / Послуга": "Всі закриті наряди", "Додаткова інформація": "Сума грн", "Значення / Кількість": general.totalRevenue });
      exportData.push({ "Категорія аналітики": "Середній чек замовлення", "Назва / Послуга": "Середня вартість ремонту", "Додаткова інформація": "грн", "Значення / Кількість": general.averageCheck });
      exportData.push({ "Категорія аналітики": "Всього створено записів", "Назва / Послуга": "У розкладі ремзони", "Додаткова інформація": "авто", "Значення / Кількість": general.totalAppointments });
      exportData.push({ "Категорія аналітики": "Успішно виконано", "Назва / Послуга": "Закриті акти", "Додаткова інформація": "замовлень", "Значення / Кількість": general.completedOrders });
      exportData.push({ "Категорія аналітики": "Конверсія успішності", "Назва / Послуга": "Відсоток виконання", "Додаткова інформація": "%", "Значення / Кількість": general.conversionRate });
      exportData.push({ "Категорія аналітики": "Інтенсивність заїздів", "Назва / Послуга": "Середнє навантаження", "Додаткова інформація": "авто/день", "Значення / Кількість": general.avgAppointmentsPerDay });
      exportData.push({}); // Порожній рядок-розділювач

      // 2. Секція: Топ послуг СТО за доходом
      if (services && services.length > 0) {
        exportData.push({ "Категорія аналітики": "ТОП ПОСЛУГ ЗА ПРИБУТКОМ", "Назва / Послуга": "", "Додаткова інформація": "", "Значення / Кількість": "" });
        services.forEach((s, idx) => {
          exportData.push({
            "Категорія аналітики": `Послуга №${idx + 1}`,
            "Назва / Послуга": s.serviceName,
            "Додаткова інформація": `${s.usageCount} разів надано`,
            "Значення / Кількість": `${s.totalRevenue.toLocaleString()} ₴`
          });
        });
        exportData.push({});
      }

      // 3. Секція: Популярні автомобілі за візитами
      if (vehicles && vehicles.length > 0) {
        exportData.push({ "Категорія аналітики": "ПОПУЛЯРНІ АВТОМОБІЛІ НА СТО", "Назва / Послуга": "", "Додаткова інформація": "", "Значення / Кількість": "" });
        vehicles.forEach((v, idx) => {
          exportData.push({
            "Категорія аналітики": `Автомобіль №${idx + 1}`,
            "Назва / Послуга": `${v.brand} ${v.model}`,
            "Додаткова інформація": "Кількість заїздів у ремзону",
            "Значення / Кількість": `${v.visitCount} візитів`
          });
        });
        exportData.push({});
      }

      // 4. Секція: Найактивніші клієнти
      if (clients && clients.length > 0) {
        exportData.push({ "Категорія аналітики": "НАЙАКТИВНІШІ КЛІЄНТИ СТО", "Назва / Послуга": "", "Додаткова інформація": "", "Значення / Кількість": "" });
        clients.forEach((c, idx) => {
          exportData.push({
            "Категорія аналітики": `Контрагент №${idx + 1}`,
            "Назва / Послуга": c.fullName,
            "Додаткова інформація": c.phone,
            "Значення / Кількість": `${c.visitCount} замовлень`
          });
        });
      }

      // Викликаємо твою функцію з клієнтського XLSX
      exportToExcel(exportData, `Аналітика_СТО_${params.periodType || "період"}`);

    } catch (error) {
      console.error("Помилка генерації Excel звіту на клієнті:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 w-full max-w-full relative">
      
      {/* Шапка модуля */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/")}
            className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1 px-3 cursor-pointer"
          >
            <ArrowLeft size={13} /> <span>На головну</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/10">
              <BarChart3 size={15} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">Звіти та аналітика</h1>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">Повна аналітика роботи автосервісу</span>
            </div>
          </div>
        </div>

        {/* 👑 КНОПКА ЕКСПОРТУ EXCEL З ІНДИКАТОРОМ ЗАВАНТАЖЕННЯ */}
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold gap-1.5 px-3 cursor-pointer disabled:opacity-70 transition-all select-none"
        >
          {isExporting ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : (
            <FileSpreadsheet size={14} className="text-emerald-600" />
          )}
          <span>{isExporting ? "Генерація..." : "Експорт Excel"}</span>
        </Button>
      </div>

      {/* 1. Блок фільтрації періодів */}
      <AnalyticsFilter onFilterChange={setParams} />

      {/* 2. Ряд KPI карток */}
      <GeneralStats params={params} />

      {/* 3. Графічна сітка віджетів (Два аналітичні графіки в ряд) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DailyActivityChart params={params} />
        <HourlyLoadChart params={params} />
      </div>

      {/* 4. Нижня сітка: Трійка Топ-Списків (Послуги, Автомобілі, Клієнти) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Топ 1: Послуги за доходом */}
        <div className="h-[340px]">
          <TopServicesList params={params} />
        </div>

        {/* Топ 2: Популярні автомобілі за візитами */}
        <div className="h-[340px]">
          <TopVehiclesList params={params} />
        </div>

        {/* Топ 3: Найактивніші клієнти контрагенти */}
        <div className="h-[340px] md:col-span-2 xl:col-span-1">
          <TopClientsList params={params} />
        </div>

      </div>

    </div>
  );
}