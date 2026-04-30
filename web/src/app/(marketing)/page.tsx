import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  Zap, 
  ShieldCheck,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-600">
              Tumbuhin
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Harga</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Tentang</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">Daftar Sekarang</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary/90 text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" />
              <span>Platform All-in-One untuk Pertumbuhan Bisnis Anda</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-tight">
              Tumbuhkan Bisnis Anda <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-600">
                Lebih Cepat & Terarah
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Solusi manajemen bisnis terlengkap. Dari monitor kondisi bisnis hingga pencairan dana otomatis, semua dalam satu dashboard yang intuitif.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                  Mulai Gratis <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Lihat Demo
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 grayscale opacity-60">
              <span className="font-bold text-2xl">GOOGLE</span>
              <span className="font-bold text-2xl">MICROSOFT</span>
              <span className="font-bold text-2xl">SHOPEE</span>
              <span className="font-bold text-2xl">TOKOPEDIA</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-white py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Fitur Unggulan Tumbuhin</h2>
              <p className="text-slate-600">Didesain khusus untuk memenuhi kebutuhan tenant dan administrator.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="w-10 h-10 text-primary" />,
                  title: "Analitik Real-time",
                  desc: "Pantau performa penjualan dan kondisi bisnis Anda kapan saja dengan grafik yang mudah dimengerti."
                },
                {
                  icon: <LayoutDashboard className="w-10 h-10 text-primary" />,
                  title: "Dashboard Terintegrasi",
                  desc: "Satu tempat untuk mengatur semua operasional, dari manajemen stok hingga pelaporan keuangan."
                },
                {
                  icon: <ShieldCheck className="w-10 h-10 text-primary" />,
                  title: "Pencairan Dana Aman",
                  desc: "Proses withdrawal yang cepat dan aman didukung oleh Midtrans IRIS langsung ke rekening Anda."
                },
                {
                  icon: <Users className="w-10 h-10 text-primary" />,
                  title: "Manajemen Tenant",
                  desc: "Bagi pemilik aplikasi, kontrol dan pantau seluruh tenant dalam ekosistem Anda dengan mudah."
                },
                {
                  icon: <TrendingUp className="w-10 h-10 text-primary" />,
                  title: "Strategi Pertumbuhan",
                  desc: "Dapatkan rekomendasi berbasis data untuk meningkatkan efisiensi dan keuntungan bisnis."
                },
                {
                  icon: <CheckCircle2 className="w-10 h-10 text-primary" />,
                  title: "Pendaftaran Instan",
                  desc: "Mulai berjualan dalam hitungan menit dengan proses registrasi yang simpel dan terverifikasi."
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none bg-background hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-8 px-8 pb-8">
                    <div className="mb-6 p-3 bg-white rounded-2xl w-fit shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Siap Mengembangkan Bisnis Anda?</h2>
            <p className="text-primary/20 mb-10 text-lg max-w-2xl mx-auto">
              Bergabunglah dengan ribuan tenant lainnya yang telah sukses bersama Tumbuhin. Daftar sekarang dan rasakan kemudahannya.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-primary/10 h-14 px-10 text-lg font-bold">
                Daftar Sekarang Secara Gratis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-slate-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">T</div>
              <span className="text-xl font-bold text-primary-foreground">Tumbuhin</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="#" className="hover:text-primary-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary-foreground">Terms of Service</Link>
              <Link href="#" className="hover:text-primary-foreground">Contact Us</Link>
            </div>
          </div>
          <div className="text-center text-sm">
            © 2026 Tumbuhin. Semua hak cipta dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
