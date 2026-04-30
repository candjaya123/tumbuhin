'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  FileText,
  Printer,
  Save,
  User,
  ShoppingBag,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { orderService } from '@/lib/api/orderService';

export default function NewOrderPage() {
  const [type, setType] = useState<'SO' | 'PO'>('SO');
  const [entityName, setEntityName] = useState('');
  const [items, setItems] = useState<any[]>([{ id: Date.now(), product_id: '', qty: 1, price: 0 }]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now(), product_id: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value };
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          if (product) updated.price = product.price;
        }
        return updated;
      }
      return i;
    }));
  };

  const subtotal = items.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const tax = subtotal * 0.11; // 11% Tax
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!entityName || items.some(i => !i.product_id || i.qty <= 0)) {
      alert("Harap lengkapi semua data pesanan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        type,
        entity_name: entityName,
        total_amount: total,
        status: 'pending',
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: Number(i.qty),
          unit_price: Number(i.price)
        }))
      });
      alert("Pesanan berhasil disimpan!");
      window.location.href = '/tenant/orders';
    } catch (err: any) {
      alert("Gagal menyimpan pesanan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tenant/orders">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{type === 'SO' ? 'Sales Order Baru' : 'Purchase Order Baru'}</h1>
            <p className="text-slate-500">Mulai pembuatan dokumen pesanan profesional.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Cetak Preview
          </Button>
          <Button className="flex gap-2" onClick={handleSave} disabled={isSubmitting}>
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor Pane */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tipe Dokumen</Label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SO">Sales Order (Penjualan)</SelectItem>
                      <SelectItem value="PO">Purchase Order (Pembelian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{type === 'SO' ? 'Nama Pelanggan / Klien' : 'Nama Supplier / Vendor'}</Label>
                  <Input 
                    value={entityName} 
                    onChange={(e) => setEntityName(e.target.value)} 
                    placeholder="Contoh: PT. Maju Jaya" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Daftar Barang</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem} className="flex gap-1">
                <Plus className="w-3 h-3" />
                Tambah Baris
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 items-end pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex-1 space-y-2">
                      <Label className={idx === 0 ? '' : 'hidden'}>Pilih Produk</Label>
                      <Select value={item.product_id} onValueChange={(val) => updateItem(item.id, 'product_id', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className={idx === 0 ? '' : 'hidden'}>Qty</Label>
                      <Input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                      />
                    </div>
                    <div className="w-40 space-y-2">
                      <Label className={idx === 0 ? '' : 'hidden'}>Harga Satuan</Label>
                      <Input 
                        type="number" 
                        value={item.price} 
                        onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Pane */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Preview Dokumen</h3>
            <div className="bg-white shadow-2xl rounded-sm p-10 min-h-[700px] border border-slate-200 aspect-[1/1.41]">
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-black text-slate-300">T</div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-800">{type === 'SO' ? 'SALES ORDER' : 'PURCHASE ORDER'}</h2>
                  <p className="text-slate-400 text-sm font-bold">#DRAFT-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-10 text-sm">
                <div>
                  <p className="text-slate-400 font-bold mb-1 uppercase text-[10px]">Dari:</p>
                  <p className="font-black text-slate-800">Tumbuhin Business Unit</p>
                  <p className="text-slate-500">Jakarta, Indonesia</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold mb-1 uppercase text-[10px]">{type === 'SO' ? 'Kepada:' : 'Kirim Ke:'}</p>
                  <p className="font-black text-slate-800">{entityName || '....................'}</p>
                  <p className="text-slate-500 italic">Ditetapkan via Sistem</p>
                </div>
              </div>

              <table className="w-full text-left text-sm mb-10">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="pb-2 font-black">Item</th>
                    <th className="pb-2 font-black text-center">Qty</th>
                    <th className="pb-2 font-black text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i, idx) => {
                    const p = products.find(prod => prod.id === i.product_id);
                    return (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-3 font-medium text-slate-700">{p?.name || 'Item Belum Dipilih'}</td>
                        <td className="py-3 text-center">{i.qty}</td>
                        <td className="py-3 text-right font-bold">Rp {(i.qty * i.price).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-end pt-6 border-t-2 border-slate-800">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Pajak (PPN 11%)</span>
                    <span className="font-bold text-slate-800">Rp {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-4 border-t">
                    <span className="font-black text-slate-800">TOTAL</span>
                    <span className="font-black text-primary">Rp {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                Dokumen ini diterbitkan secara otomatis oleh Sistem Tumbuhin ERP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
