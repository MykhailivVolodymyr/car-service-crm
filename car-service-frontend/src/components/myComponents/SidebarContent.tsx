"use client";

import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, PlusCircle, Search, 
  Wrench, Wallet, Package, 
  BarChart3, Settings, Brain, 
  CreditCard, MessageSquare, ExternalLink, 
  LifeBuoy, Car 
} from "lucide-react";

const menuGroups = [
  {
    title: "Записи",
    items: [
      { name: "Головна", icon: LayoutDashboard, href: "/" },
      { name: "Додати запис", icon: PlusCircle, href: "#" },
      { name: "Знайти клієнта", icon: Search, href: "#" },
    ],
  },
  {
    title: "Управління",
    items: [
      { name: "Майстри та послуги", icon: Wrench, href: "#" },
      { name: "Каса", icon: Wallet, href: "#" },
      { name: "Склад запчастин", icon: Package, href: "#" },
    ],
  },
  {
    title: "Звіти",
    items: [
      { name: "Аналітика", icon: BarChart3, href: "#" },
    ],
  },
  {
    title: "Система",
    items: [
      { name: "Налаштування", icon: Settings, href: "#" },
      { name: "AI-Аналіз", icon: Brain, href: "#" },
      { name: "Тариф / Баланс", icon: CreditCard, href: "#" },
      { name: "Зворотній зв'язок", icon: MessageSquare, href: "#" },
    ],
  },
  {
    title: "Зовнішні посилання",
    items: [
      { name: "Автозапчастини", icon: ExternalLink, href: "#" },
      { name: "Підтримка", icon: LifeBuoy, href: "#" },
    ],
  },
];

interface SidebarContentProps {
  onItemClick?: () => void;
}

export default function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Синя шапка сайдбару (залишаємо висоту h-20 для гарного розриву з хедером) */}
      <div className="h-20 bg-blue-600 flex items-center px-6 gap-3 text-white shadow-md shrink-0">
        <div className="p-2 bg-white/10 rounded-lg">
          <Car size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-wider uppercase leading-none">Servio CRM</span>
          <span className="text-[11px] text-blue-100 mt-1.5 opacity-90 font-medium">Мій автосервіс</span>
        </div>
      </div>

      {/* Скролований список меню */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {/* Заголовки груп */}
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              {group.title}
            </h3>
            
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <a
                    key={itemIdx}
                    href={item.href}
                    onClick={() => onItemClick?.()}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-l-none pl-2.5"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {/* Помірний колір іконок (text-slate-500), при наведенні стає темнішим */}
                    <Icon 
                      size={18} 
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                      }`} 
                    />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}