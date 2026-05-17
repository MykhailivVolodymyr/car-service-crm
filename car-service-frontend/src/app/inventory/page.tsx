"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartsStorageTab from "@/features/inventory/components/PartsStorageTab";
import ServicesPriceTab from "@/features/inventory/components/ServicesPriceTab";
import { Package, Wrench, Boxes } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="p-4 md:py-4 md:px-6 space-y-4 font-sans antialiased text-slate-600 select-none">
      
      {/* ВЕРХНЯ ЗАГОЛОВКОВА ПАНЕЛЬ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl">
            <Boxes size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Номенклатура та Склад</h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Керування матеріальними запасами СТО та прайсом послуг</p>
          </div>
        </div>
      </div>

      {/* ТАБ-ПЕРЕМИКАЧ ВІД SHADCN */}
      <Tabs defaultValue="parts" className="w-full space-y-4">
        <div className="w-full flex justify-start">
          <TabsList className="bg-slate-100/70 p-1 rounded-xl border border-slate-200/50 h-10">
            <TabsTrigger 
              value="parts" 
              className="text-xs font-bold gap-1.5 px-4 h-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition"
            >
              <Package size={14} className="text-slate-400 data-[state=active]:text-blue-500" />
              <span>Склад запчастин</span>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="text-xs font-bold gap-1.5 px-4 h-8 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition"
            >
              <Wrench size={14} className="text-slate-400 data-[state=active]:text-blue-500" />
              <span>Прайс авторобіт</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* КОНТЕНТ ТАБІВ */}
        <TabsContent value="parts" className="outline-none mt-0 animate-in fade-in duration-200">
          <PartsStorageTab />
        </TabsContent>

        <TabsContent value="services" className="outline-none mt-0 animate-in fade-in duration-200">
          <ServicesPriceTab />
        </TabsContent>
      </Tabs>

    </div>
  );
}