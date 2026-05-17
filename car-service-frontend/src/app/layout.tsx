import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/myComponents/Header"; // Імпортуємо хедер
import Sidebar from "@/components/myComponents/Sidebar"; // Імпортуємо наш сайдбар

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Servio CRM",
  description: "Система управління автосервісом та обліку замовлень",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex bg-slate-50 font-sans"> 
        {/* Бокове меню (на мобілках сховається, на ПК буде фіксоване зліва) */}
        <Sidebar />

        {/* Права робоча частина: Хедер + Контент сторінки */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header />
          
          {/* Скрольована область для самого контенту сторінок */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}