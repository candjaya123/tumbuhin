'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Store, Users, Calculator } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    products: '',
    assets: '',
    suppliers: '',
  });

  const handleSetup = async () => {
    setLoading(true);
    try {
      // Pre-processing / Scoring Logic (Task 3.2)
      let scale = 'UMKM';
      const assetsNum = parseInt(formData.assets.replace(/\D/g, '')) || 0;
      if (assetsNum < 50000000) scale = 'Mikro';
      else if (assetsNum > 500000000) scale = 'Menengah';

      let complexity = 'Sederhana';
      const supplierNum = parseInt(formData.suppliers) || 0;
      if (supplierNum > 10) complexity = 'Tinggi';
      else if (supplierNum > 3) complexity = 'Menengah';

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/onboarding/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          industry: formData.products,
          scale,
          complexity,
        }),
      });

      if (!response.ok) throw new Error('Gagal membangun sistem');

      toast({
        title: "Sistem Berhasil Dibangun! 🚀",
        description: "Buku besar dan modul Anda telah dikonfigurasi otomatis oleh AI.",
      });

      router.push('/tenant');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Waduh, ada masalah!",
        description: error instanceof Error ? error.message : "Terjadi kesalahan sistem",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 animate-pulse">
          AI sedang merancang sistem akuntansi Anda...
        </h1>
        <p className="text-slate-500 mt-2 max-w-md">
          Kami sedang menyiapkan Chart of Accounts (COA), aturan pajak, dan modul yang sesuai dengan profil bisnis Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-900">Selamat Datang di Tumbuhin!</CardTitle>
          <CardDescription className="text-lg">
            Bantu kami memahami bisnis Anda agar AI bisa menyiapkan sistem yang pas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-blue-600" />
              <Label htmlFor="products" className="text-lg font-semibold">
                Ceritakan sedikit, produk atau jasa apa saja yang Anda jual?
              </Label>
            </div>
            <Textarea
              id="products"
              placeholder="Contoh: Saya menjual aneka kopi susu, roti bakar, dan cemilan di kafe kecil saya."
              className="min-h-[100px] text-lg p-4"
              value={formData.products}
              onChange={(e) => setFormData({ ...formData, products: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              <Label htmlFor="assets" className="text-lg font-semibold">
                Kira-kira berapa estimasi total aset atau omset per bulan saat ini?
              </Label>
            </div>
            <Input
              id="assets"
              type="text"
              placeholder="Contoh: 15,000,000"
              className="text-lg p-4 h-14"
              value={formData.assets}
              onChange={(e) => setFormData({ ...formData, assets: e.target.value })}
            />
            <p className="text-sm text-slate-400 italic">*Data ini membantu menentukan skala bisnis Anda (Mikro/UMKM).</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <Label htmlFor="suppliers" className="text-lg font-semibold">
                Berapa banyak supplier atau vendor yang rutin Anda beli barangnya?
              </Label>
            </div>
            <Input
              id="suppliers"
              type="number"
              placeholder="Contoh: 5"
              className="text-lg p-4 h-14"
              value={formData.suppliers}
              onChange={(e) => setFormData({ ...formData, suppliers: e.target.value })}
            />
            <p className="text-sm text-slate-400 italic">*Membantu menentukan kerumitan pengelolaan hutang & pajak.</p>
          </div>

          <Button 
            className="w-full h-16 text-xl font-bold rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            onClick={handleSetup}
            disabled={!formData.products || !formData.assets}
          >
            Bangun Sistem Saya <Rocket className="w-6 h-6" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
