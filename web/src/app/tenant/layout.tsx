"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Settings, 
  LogOut, 
  ShoppingBag,
  Package,
  FileText,
  Menu, 
  X,
  Bell,
  User
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { profileService } from '@/lib/api/profileService';

import { ChatWidget } from '@/components/ai/ChatWidget';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const data = await profileService.getTenant();
        setTenant(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTenant();
  }, []);

  const userTier = tenant?.tier || 'starter';
  const isBusiness = userTier === 'business' || userTier === 'pro';
  const isPro = userTier === 'pro';

  const menuItems = [
    { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, show: true },
    { name: 'Kasir POS', href: '/tenant/pos', icon: ShoppingBag, show: true },
    { name: 'Produk & Stok', href: '/tenant/inventory', icon: Package, show: true },
    { name: 'Manajemen Staf', href: '/tenant/staff', icon: User, show: isBusiness },
    { name: 'Analisa Pro (AI)', href: '/tenant/drafts', icon: FileText, show: isPro },
    { name: 'Penarikan Dana', href: '/tenant/withdrawal', icon: Wallet, show: true },
    { name: 'Pengaturan', href: '/tenant/settings', icon: Settings, show: true },
  ].filter(item => item.show);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-secondary/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
              <span className="text-xl font-bold text-foreground">Tumbuhin</span>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-600 hover:bg-background hover:text-primary'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        <ChatWidget />
      </div>
    </div>
  );
}
