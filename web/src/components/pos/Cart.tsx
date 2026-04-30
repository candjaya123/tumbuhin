'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Percent, 
  Tag, 
  CreditCard,
  Loader2
} from "lucide-react";

interface CartProps {
  cart: any[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
  taxRate: number;
  discount: number;
  formatCurrency: (val: number) => string;
}

export function Cart({ 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  isProcessing, 
  taxRate, 
  discount,
  formatCurrency 
}: CartProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount - discount;

  return (
    <Card className="w-full lg:w-[400px] border-none shadow-lg bg-white flex flex-col overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Detail Pesanan
          </CardTitle>
          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
            {cart.length} Item
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 group">
            <div className="flex-grow">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
              <p className="text-xs text-slate-500">{formatCurrency(item.selling_price)} / unit</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
              <button 
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="p-1 hover:bg-white rounded transition-colors text-slate-500"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="p-1 hover:bg-white rounded transition-colors text-slate-500"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50 py-20">
            <ShoppingBag className="w-12 h-12" />
            <p className="text-sm">Keranjang masih kosong</p>
          </div>
        )}
      </CardContent>

      <div className="p-6 border-t bg-slate-50/50 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1 text-slate-500">
              <Percent className="w-3 h-3" />
              <span>Pajak ({Math.round(taxRate * 100)}%)</span>
            </div>
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Diskon</span>
              </div>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">Total Pembayaran</span>
            <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            disabled={cart.length === 0 || isProcessing}
            onClick={onCheckout}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Proses Bayar
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
