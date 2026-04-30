"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tenant' | 'client'>('tenant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // In a real app, you might have a trigger to create a profile, 
    // or you do it here manually if the trigger isn't set up.
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: data.user.id, email: email, role: role }
        ]);
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md shadow-xl border-none text-center py-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-primary/80" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Registrasi Berhasil!</h2>
            <p className="text-slate-600">
              Silakan periksa email Anda untuk verifikasi akun sebelum masuk ke dashboard.
            </p>
            <Link href="/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 h-11">
                Kembali ke Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 py-12">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl">T</div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Buat Akun Tumbuhin</CardTitle>
          <CardDescription>
            Mulai kelola bisnis Anda dengan lebih profesional hari ini
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === 'tenant' 
                    ? 'border-primary bg-primary/10 text-primary/90' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                Pemilik Bisnis (Tenant)
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === 'client' 
                    ? 'border-primary bg-primary/10 text-primary/90' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                Klien / Pengguna
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@perusahaan.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={8}
              />
            </div>
            <div className="text-xs text-slate-500">
              Dengan mendaftar, Anda menyetujui <Link href="#" className="text-primary hover:underline">Syarat & Ketentuan</Link> kami.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Daftar Sekarang
            </Button>
            <div className="text-sm text-center text-slate-500">
              Sudah punya akun? <Link href="/login" className="text-primary font-semibold hover:underline">Masuk di sini</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
