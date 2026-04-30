'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { journalService } from '@/lib/api/journalService';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      const data = await journalService.getDrafts();
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleApprove = async (draftId: string) => {
    try {
      await journalService.approveDraft(draftId);
      alert('Draft approved successfully!');
      fetchDrafts();
    } catch (error: any) {
      console.error('Error approving draft:', error);
      alert(`Approval failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Validasi Transaksi AI</h1>
        <p className="text-slate-500">Tinjau dan setujui draf jurnal yang dihasilkan oleh AI OCR.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Draf Menunggu Persetujuan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Total Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell></TableRow>
              ) : drafts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Tidak ada draf tertunda</TableCell></TableRow>
              ) : drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell>{new Date(draft.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{draft.source}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    Rp {draft.payload?.total_amount?.toLocaleString('id-ID') || '0'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                      {draft.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => alert(JSON.stringify(draft.payload, null, 2))}>
                      <Eye className="w-4 h-4 mr-2" /> Detail
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleApprove(draft.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
