'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LedgerLine {
  id: string;
  created_at: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerTableProps {
  lines: LedgerLine[];
  accountName: string;
}

export function LedgerTable({ lines, accountName }: LedgerTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Buku Besar: {accountName}</h3>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px]">Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right font-bold text-primary">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="text-slate-500 text-xs">
                  {new Date(line.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="font-medium text-slate-700">{line.description}</TableCell>
                <TableCell className="text-right text-green-600">
                  {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900 bg-slate-50/50">
                  {formatCurrency(line.balance)}
                </TableCell>
              </TableRow>
            ))}
            {lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                  Tidak ada riwayat transaksi untuk akun ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
