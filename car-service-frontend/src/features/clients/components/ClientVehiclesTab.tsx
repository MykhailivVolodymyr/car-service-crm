"use client";

import { VehicleDto } from "../types/ClientDetails";
import { Car, Calendar, CreditCard, Key, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientVehiclesTabProps {
  vehicles: VehicleDto[];
  onAddVehicleClick: () => void;
  onEditVehicleClick: (vehicle: VehicleDto) => void;
  onDeleteVehicleClick: (id: number) => void;
}

export default function ClientVehiclesTab({ 
  vehicles, 
  onAddVehicleClick, 
  onEditVehicleClick, 
  onDeleteVehicleClick 
}: ClientVehiclesTabProps) {
  
  return (
    <div className="space-y-4 font-sans antialiased select-none">
      
      {/* ВЕРХНІЙ РЯДОК ДІЙ ВКЛАДКИ */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm">
        <div className="text-xs font-black text-slate-800 tracking-tight">
          Транспортні засоби контрагента
        </div>
        <Button
          type="button"
          onClick={onAddVehicleClick}
          className="h-8 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1 shadow-sm px-3 cursor-pointer transition-all"
        >
          <Plus size={12} className="stroke-[2.5]" /> <span>Прив'язати автомобіль</span>
        </Button>
      </div>

      {/* СІТКА КАРТОК АВТОМОБІЛІВ */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-xs">
          У гаражі цього контрагента ще немає зареєстрованих автомобілів.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((car) => (
            <div 
              key={car.id} 
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-4 hover:border-slate-200/80 transition relative group"
            >
              {/* Іконка авто */}
              <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl shrink-0">
                <Car size={20} className="stroke-[2.2]" />
              </div>
              
              {/* Дані про машину */}
              <div className="space-y-2 min-w-0 flex-1pr-12"> {/* Додав відступ справа під кнопки */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">{car.brandName} {car.modelName}</h4>
                  <span className="text-[10px] font-medium text-slate-400 block mt-0.5">ID автомобіля: #{car.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <CreditCard size={12} className="text-slate-400" />
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-black tracking-wide uppercase tabular-nums">{car.licensePlate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Рік: <strong className="text-slate-700 font-bold tabular-nums">{car.year}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium col-span-2 truncate">
                    <Key size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">VIN: <strong className="text-slate-800 font-black select-all tabular-nums">{car.vin}</strong></span>
                  </div>
                </div>
              </div>

              {/* 👑 КНОПКИ УПРАВЛІННЯ КАРТКОЮ АВТО (РЕДАГУВАТИ / ВИДАЛИТИ) */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditVehicleClick(car)}
                  className="p-1.5 bg-slate-50 border border-slate-200/60 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-slate-400 rounded-lg transition cursor-pointer"
                  title="Редагувати параметри авто"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => onDeleteVehicleClick(car.id)}
                  className="p-1.5 bg-slate-50 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-400 rounded-lg transition cursor-pointer"
                  title="Вилучити авто з гаража"
                >
                  <Trash2 size={11} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}