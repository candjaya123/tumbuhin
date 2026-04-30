'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Zap,
  Bot
} from "lucide-react";
import { reportService } from '@/lib/api/reportService';
import { profileService } from '@/lib/api/profileService';
import { createClient } from '@/lib/supabase/client';
import { BlurredInsight } from '@/components/ai/BlurredInsight';

const supabase = createClient();

export default function TenantOverview() {
  const [incomeData, setIncomeData] = useState({ revenue: 0, expenses: 0, net_profit: 0 });
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const [tenant, setTenant] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();

        const [income, tnt] = await Promise.all([
          reportService.getIncomeStatement(start.toISOString(), end.toISOString()),
          profileService.getTenant()
        ]);
        
        if (income) setIncomeData(income);
        if (tnt) setTenant(tnt);

        // Fetch alerts if Business+
        if (tnt?.tier === 'business' || tnt?.tier === 'ai') {
          const { data } = await supabase
            .from('smart_alerts')
            .select('*')
            .eq('tenant_id', tnt.id)
            .eq('is_read', false)
            .limit(3);
          if (data) setAlerts(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userTier = tenant?.tier || 'starter';
  const isStarter = userTier === 'starter';
  const isBusiness = userTier === 'business' || userTier === 'pro';
  const isPro = userTier === 'pro';

  const stats = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(incomeData.revenue),
      change: "+12.5%",
      isPositive: true,
      icon: <Wallet className="w-5 h-5 text-primary" />
    },
    {
      title: "Pesanan Baru",
      value: "154",
      change: "+8.2%",
      isPositive: true,
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />
    },
    {
      title: "Laba Bersih",
      value: formatCurrency(incomeData.net_profit),
      change: "+10.2%",
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-green-600" />
    },
    {
      title: "Tingkat Konversi",
      value: "3.2%",
      change: "+0.5%",
      isPositive: true,
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Tenant</h1>
        <p className="text-slate-500">Selamat datang kembali! Berikut adalah ringkasan bisnis Anda hari ini.</p>
      </div>

      {/* AI Upsell Banner (Khusus Starter/Business tanpa Pro) */}
      {!isPro && (
        <Card className="border-none bg-gradient-to-r from-amber-50 to-amber-100 shadow-sm overflow-hidden border border-amber-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Bot className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Tingkatkan Bisnis dengan AI Auto</p>
                <p className="text-sm text-amber-700">Dapatkan analisa mendalam dan asisten AI 24/7 untuk optimasi stok & margin.</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors">
              Upgrade Sekarang
            </button>
          </CardContent>
        </Card>
      )}

      {/* Smart Alerts (Khusus Business+) */}
      {isBusiness && alerts.length > 0 && (
        <Card className="border-none shadow-sm bg-blue-50 border border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-bold text-blue-900">Smart Alerts (Deterministik)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {alert.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => ( stat.title === "Total Pendapatan" ? (
          <Card key={i} className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute right-0 top-0 p-4 opacity-20 transform translate-x-2 -translate-y-2">
              <stat.icon.type {...stat.icon.props} className="w-24 h-24 text-primary-foreground" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "Loading..." : stat.value}</div>
              <div className="flex items-center mt-1 text-white/40 text-xs">
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                <span>{stat.change} dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className="p-2 bg-background rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading && (stat.title === "Laba Bersih") ? "..." : stat.value}</div>
              <div className={`flex items-center mt-1 text-xs ${stat.isPositive ? 'text-primary' : 'text-red-600'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                <span>{stat.change} dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>

      {/* AI Teaser Insights (For Starter/Business) */}
      {(isStarter || (isBusiness && !isPro)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BlurredInsight 
            title="Analisa Margin"
            teaserText="Produk Kopi Susu Aren menurunkan margin Anda sebesar 15% minggu ini..."
            lockedText="...karena pola diskon berlebih di jam 2 siang yang tidak sebanding dengan volume."
            tierRequired="Business"
          />
          <BlurredInsight 
            title="Prediksi Stok"
            teaserText="Stok Biji Kopi Arabica akan habis dalam 3 hari ke depan..."
            lockedText="...AI mendeteksi lonjakan permintaan 20% setiap akhir bulan (Gajian Cycle)."
            tierRequired="Pro"
          />
        </div>
      )}

      {/* Main Charts / Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm h-[400px] flex items-center justify-center bg-white">
          <div className="text-center text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Grafik Penjualan akan muncul di sini</p>
          </div>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-foreground">Pelanggan #{i + 1234}</p>
                  <p className="text-xs text-slate-500">2 menit yang lalu</p>
                </div>
                <div className="text-sm font-bold text-primary">
                  +Rp 250k
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-sm text-primary font-semibold hover:underline">
              Lihat Semua Pesanan
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
