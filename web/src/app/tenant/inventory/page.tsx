'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  MapPin, 
  ArrowRightLeft, 
  Plus, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          warehouses (name)
        `)
        .order('name');
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Inventaris</h1>
          <p className="text-slate-500">Kelola stok barang Anda di seluruh lokasi gudang.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tenant/inventory/transfer">
            <Button variant="outline" className="flex gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Stok
            </Button>
          </Link>
          <Link href="/tenant/inventory/warehouses">
            <Button variant="outline" className="flex gap-2">
              <MapPin className="w-4 h-4" />
              Kelola Gudang
            </Button>
          </Link>
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">Memuat data inventaris...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">Belum ada produk terdaftar.</TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category || '-'}</TableCell>
                    <TableCell>{p.warehouses?.name || 'Gudang Utama'}</TableCell>
                    <TableCell className="text-right">{p.stock} {p.unit || 'unit'}</TableCell>
                    <TableCell className="text-right">Rp {p.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
