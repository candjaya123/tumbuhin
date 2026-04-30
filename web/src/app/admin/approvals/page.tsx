"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  HandCoins, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function AdminApprovals() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pendingPayouts = [
    { id: 'WD-003', tenant: 'Coffee Shop A', date: '2026-04-23', amount: 1000000, bank: 'BCA - 1234****' },
    { id: 'WD-004', tenant: 'Gadget Hub', date: '2026-04-24', amount: 3500000, bank: 'Mandiri - 9876****' },
    { id: 'WD-005', tenant: 'Fashion Store B', date: '2026-04-24', amount: 500000, bank: 'BNI - 5544****' },
  ];

  const handleApprove = (id: string) => {
    setProcessingId(id);
    // Simulating Midtrans IRIS API call
    setTimeout(() => {
      setProcessingId(null);
      setSuccessMsg(`Dana untuk ${id} berhasil dikirim melalui Midtrans IRIS.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Persetujuan Payout</h1>
        <p className="text-slate-500">Kelola permintaan penarikan dana dari tenant secara aman via Midtrans.</p>
      </div>

      {successMsg && (
        <div className="bg-primary/10 border border-primary/30 text-primary/90 text-primary-foreground p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-primary/80" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Menunggu Persetujuan</CardTitle>
              <CardDescription>Ada {pendingPayouts.length} permintaan baru yang perlu ditinjau.</CardDescription>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              Verifikasi Rekening Diperlukan
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="font-bold">ID / Tanggal</TableHead>
                <TableHead className="font-bold">Tenant</TableHead>
                <TableHead className="font-bold">Jumlah</TableHead>
                <TableHead className="font-bold">Rekening Bank</TableHead>
                <TableHead className="text-right font-bold">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{payout.id}</div>
                    <div className="text-[10px] text-slate-500">{payout.date}</div>
                  </TableCell>
                  <TableCell className="font-medium">{payout.tenant}</TableCell>
                  <TableCell className="font-bold text-primary">Rp {payout.amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="text-sm">{payout.bank}</div>
                    <button className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                      Cek Validitas <ExternalLink className="w-2 h-2" />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 px-3 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={!!processingId}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Tolak
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-9 px-3 bg-primary hover:bg-primary/90"
                        onClick={() => handleApprove(payout.id)}
                        disabled={!!processingId}
                      >
                        {processingId === payout.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <HandCoins className="w-4 h-4 mr-1" />
                        )}
                        Setujui & Kirim
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {pendingPayouts.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Semua permintaan sudah diproses.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-600 text-primary-foreground">
          <CardContent className="pt-6">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Payout Bulan Ini</p>
            <h4 className="text-2xl font-bold">Rp 842.000.000</h4>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Berhasil Terkirim</p>
            <h4 className="text-2xl font-bold text-foreground">124 Transaksi</h4>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Midtrans IRIS</p>
            <h4 className="text-2xl font-bold text-foreground">Rp 1.250.000.000</h4>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
