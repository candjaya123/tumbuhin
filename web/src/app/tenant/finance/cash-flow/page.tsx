'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  History,
  Loader2,
  Calendar
} from "lucide-react";

export default function CashFlowPage() {
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCashFlow = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/finance/cash-flow`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Gagal mengambil data arus kas');
        const data = await response.json();

        // Transform data backend ke format UI
        const transformed = (data || []).map((l: any) => ({
          id: l.id,
          created_at: l.created_at,
          description: l.journal_entries?.description || "Transaksi Kas",
          debit: l.debit,
          credit: l.credit,
          accounts: { name: l.chart_of_accounts?.name }
        }));

        setCashFlow(transformed);
      } catch (error) {
        console.error('Error fetching cash flow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [supabase]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const totalIn = cashFlow.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalOut = cashFlow.reduce((sum, item) => sum + (item.credit || 0), 0);
  const netFlow = totalIn - totalOut;

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
          <Wallet className="w-8 h-8 text-primary" />
          Arus Kas (Cash Flow)
        </h1>
        <p className="text-slate-500 font-medium">Lacak pergerakan uang tunai masuk dan keluar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Masuk</p>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800">{formatCurrency(totalIn)}</h2>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Keluar</p>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-800">{formatCurrency(totalOut)}</h2>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm text-white ${netFlow >= 0 ? 'bg-slate-800' : 'bg-red-900'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">Arus Kas Bersih</p>
              <History className="w-4 h-4 opacity-60" />
            </div>
            <h2 className="text-2xl font-black">{formatCurrency(netFlow)}</h2>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Riwayat Arus Kas Terakhir
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Menampilkan 50 data terakhir</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Akun</th>
                  <th className="px-6 py-4 text-right">Masuk (+)</th>
                  <th className="px-6 py-4 text-right">Keluar (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cashFlow.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{item.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {item.accounts?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.debit > 0 ? (
                        <span className="text-sm font-bold text-green-600">+{formatCurrency(item.debit)}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.credit > 0 ? (
                        <span className="text-sm font-bold text-red-600">-{formatCurrency(item.credit)}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
                {cashFlow.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                      Belum ada pergerakan kas tercatat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
