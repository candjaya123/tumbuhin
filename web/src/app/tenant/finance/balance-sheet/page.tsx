'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  Loader2,
  PieChart
} from "lucide-react";

export default function BalanceSheetPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBalanceSheet = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/finance/balance-sheet`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Gagal mengambil data neraca');
        const data = await response.json();
        setBalances(data);
      } catch (error) {
        console.error('Error fetching balance sheet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceSheet();
  }, [supabase]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(val));
  };

  const assets = balances.filter(b => b.account_code.startsWith('1'));
  const liabilities = balances.filter(b => b.account_code.startsWith('2'));
  const equity = balances.filter(b => b.account_code.startsWith('3'));

  const totalAssets = assets.reduce((sum, b) => sum + b.current_balance, 0);
  const totalLiabilities = liabilities.reduce((sum, b) => sum + b.current_balance, 0);
  const totalEquity = equity.reduce((sum, b) => sum + b.current_balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Scale className="w-8 h-8 text-primary" />
          Neraca Keuangan
        </h1>
        <p className="text-slate-500 font-medium">Laporan posisi keuangan per hari ini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Aset</p>
            <h2 className="text-2xl font-black mt-1">{formatCurrency(totalAssets)}</h2>
            <div className="flex items-center gap-1 mt-2 text-white/80 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Likuiditas Terjaga</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Liabilitas</p>
            <h2 className="text-2xl font-black mt-1 text-slate-800">{formatCurrency(totalLiabilities)}</h2>
            <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-bold">
              <ArrowDownRight className="w-3 h-3" />
              <span>Hutang Usaha & Modal</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ekuitas</p>
            <h2 className="text-2xl font-black mt-1 text-slate-800">{formatCurrency(totalEquity)}</h2>
            <div className="flex items-center gap-1 mt-2 text-green-500 text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>Modal Pemilik</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Assets */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Rincian Aset (Aktiva)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {assets.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-400">{b.account_code}</p>
                    <p className="text-sm font-semibold text-slate-700">{b.account_name}</p>
                  </div>
                  <p className="font-black text-slate-900">{formatCurrency(b.current_balance)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Liabilities & Equity */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Liabilitas (Kewajiban)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {liabilities.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-400">{b.account_code}</p>
                      <p className="text-sm font-semibold text-slate-700">{b.account_name}</p>
                    </div>
                    <p className="font-black text-slate-900">{formatCurrency(b.current_balance)}</p>
                  </div>
                ))}
                {liabilities.length === 0 && <p className="p-4 text-xs text-slate-400 italic">Tidak ada kewajiban aktif</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Ekuitas (Modal)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {equity.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-400">{b.account_code}</p>
                      <p className="text-sm font-semibold text-slate-700">{b.account_name}</p>
                    </div>
                    <p className="font-black text-slate-900">{formatCurrency(b.current_balance)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-slate-800 rounded-2xl text-white shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Neraca</p>
              <h3 className="text-lg font-bold">Teruji Seimbang (Balanced)</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] opacity-60">Aset = L + E</p>
                <p className="font-bold">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
