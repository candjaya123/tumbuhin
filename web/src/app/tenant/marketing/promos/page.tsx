'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TicketPercent, 
  Plus, 
  Calendar, 
  Tag, 
  ShoppingBag,
  Trash2,
  Settings2,
  Sparkles,
  Loader2
} from "lucide-react";

export default function PromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      // Seharusnya pakai backend API tapi untuk demo ini kita fetch list dulu
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <TicketPercent className="w-8 h-8 text-primary" />
            Promo & Diskon
          </h1>
          <p className="text-slate-500 font-medium">Buat aturan promosi otomatis untuk meningkatkan penjualan</p>
        </div>
        <Button className="gap-2 rounded-xl h-11 px-6">
          <Plus className="w-4 h-4" />
          Buat Promo Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <Card key={promo.id} className="border-none shadow-sm hover:shadow-xl transition-all group relative overflow-hidden bg-white">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Sparkles className="w-24 h-24 text-primary" />
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-primary/10`}>
                  {promo.type === 'discount_percentage' ? <Tag className="w-6 h-6 text-primary" /> : <ShoppingBag className="w-6 h-6 text-primary" />}
                </div>
                <Badge variant={promo.is_active ? "default" : "secondary"} className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                  {promo.is_active ? 'Aktif' : 'Non-Aktif'}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800">{promo.name}</h3>
                <p className="text-sm text-slate-400 font-bold mt-1">
                  {promo.type === 'discount_percentage' ? `Diskon ${promo.rules.percentage}%` : `Beli ${promo.rules.x_qty} Gratis ${promo.rules.y_qty}`}
                </p>
              </div>

              <div className="pt-4 border-t flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {promo.starts_at ? new Date(promo.starts_at).toLocaleDateString() : 'Tanpa batas'} 
                    - 
                    {promo.ends_at ? new Date(promo.ends_at).toLocaleDateString() : 'Tanpa batas'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg gap-2 text-xs font-bold border-slate-100 hover:bg-slate-50">
                  <Settings2 className="w-3.5 h-3.5" />
                  Atur Aturan
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-red-500 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {promos.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <TicketPercent className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-slate-500">Belum Ada Promo Aktif</p>
              <p className="text-xs text-slate-400 font-medium">Klik tombol "Buat Promo Baru" untuk memulai kampanye pemasaran Anda.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
