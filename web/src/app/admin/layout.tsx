"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  HandCoins, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { name: 'Semua Tenant', href: '/admin/tenants', icon: Users },
    { name: 'Persetujuan Payout', href: '/admin/approvals', icon: HandCoins },
    { name: 'Pengaturan Platform', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-secondary text-primary-foreground transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/80/20">T</div>
              <div>
                <span className="text-xl font-bold block">Tumbuhin</span>
                <span className="text-[10px] text-primary/60 uppercase tracking-widest font-bold">Super Admin</span>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input 
                className="bg-slate-800 border-none pl-10 h-10 text-sm focus-visible:ring-primary/80 placeholder:text-slate-500" 
                placeholder="Cari fitur..." 
              />
            </div>
          </div>

          <nav className="flex-grow px-4 space-y-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold px-4 mb-2 tracking-wider">Main Navigation</div>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-primary-foreground'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 bg-slate-800/50 m-4 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary/60" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold truncate">Admin Tumbuhin</p>
                <p className="text-[10px] text-slate-500 truncate">admin@tumbuhin.com</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full justify-start gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-none h-10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-foreground">
                {menuItems.find(i => i.href === pathname)?.name || 'Admin Panel'}
              </h2>
              <p className="text-xs text-slate-500">Ekosistem Manajemen Tumbuhin</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
              <span className="text-xs font-bold text-primary/90">System Online</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
