"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function WithdrawalPage() {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const balance = 15750000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setAmount('');
    }, 2000);
  };

  const history = [
    { id: 'WD-001', date: '2026-04-20', amount: 5000000, status: 'success', bank: 'BCA - 1234****' },
    { id: 'WD-002', date: '2026-04-22', amount: 2500000, status: 'processing', bank: 'Mandiri - 9876****' },
    { id: 'WD-003', date: '2026-04-23', amount: 1000000, status: 'pending', bank: 'BCA - 1234****' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary/90 text-primary-foreground"><CheckCircle2 className="w-3 h-3" /> Berhasil</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Diproses</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Ditolak</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Penarikan Dana</h1>
        <p className="text-slate-500">Tarik penghasilan Anda langsung ke rekening bank terdaftar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance & Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-teal-700 text-primary-foreground overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Wallet className="w-48 h-48 -mr-12 -mb-12" />
            </div>
            <CardContent className="pt-8">
              <p className="text-primary/20 text-sm font-medium mb-2">Saldo Tersedia</p>
              <h2 className="text-4xl font-bold mb-6">Rp {balance.toLocaleString('id-ID')}</h2>
              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-primary/20 text-xs mb-1">Total Ditarik</p>
                  <p className="font-bold">Rp 8.500.000</p>
                </div>
                <div className="flex-1 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-primary/20 text-xs mb-1">Status Akun</p>
                  <p className="font-bold">Terverifikasi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Buat Permintaan Penarikan</CardTitle>
              <CardDescription>Dana akan diproses dalam waktu maksimal 1x24 jam kerja.</CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 bg-primary/10 border border-primary/30 text-primary/90 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold">Permintaan Berhasil Dikirim!</p>
                    <p className="text-sm">Silakan tunggu konfirmasi admin dan pengecekan oleh sistem Midtrans.</p>
                  </div>
                  <button onClick={() => setSuccess(false)} className="ml-auto text-primary-foreground/50 hover:text-primary-foreground">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah Penarikan (Rp)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Contoh: 1000000" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min={50000}
                    />
                    <p className="text-[10px] text-slate-400">Minimal penarikan Rp 50.000</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Rekening Tujuan</Label>
                    <Input 
                      id="bank" 
                      placeholder="Nama Bank - No Rekening" 
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Pastikan data rekening sudah benar. Kesalahan input rekening dapat menyebabkan dana tidak terkirim atau tertunda.</p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-lg" disabled={loading || !amount || !bankAccount}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowUpRight className="w-5 h-5 mr-2" />}
                  Tarik Dana Sekarang
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Riwayat Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 space-y-2 hover:bg-background transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground">Rp {item.amount.toLocaleString('id-ID')}</p>
                        <p className="text-[10px] text-slate-400">{item.id} • {item.date}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.bank}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary font-semibold">
                Lihat Semua Riwayat
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-secondary text-primary-foreground">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Jika Anda mengalami masalah dengan penarikan dana, silakan hubungi tim support kami melalui tombol di bawah.
              </p>
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-primary-foreground">
                Hubungi Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
