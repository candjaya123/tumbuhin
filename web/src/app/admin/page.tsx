import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Store, 
  HandCoins, 
  TrendingUp,
  ArrowUpRight,
  Activity,
  Globe
} from "lucide-react";

export default function AdminOverview() {
  const stats = [
    { title: "Total Tenant", value: "1,284", change: "+42", icon: <Store className="w-5 h-5 text-primary/80" /> },
    { title: "Pengguna Aktif", value: "48,502", change: "+1,204", icon: <Users className="w-5 h-5 text-blue-500" /> },
    { title: "Total Transaksi", value: "Rp 1.4B", change: "+18%", icon: <HandCoins className="w-5 h-5 text-amber-500" /> },
    { title: "Uptime Sistem", value: "99.98%", change: "Stable", icon: <Activity className="w-5 h-5 text-purple-500" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-slate-500">Pantau performa seluruh ekosistem Tumbuhin secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center px-4 py-2 border-none shadow-sm">
            <Globe className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-sm font-medium">All Regions</span>
          </Card>
          <Card className="flex items-center px-4 py-2 border-none shadow-sm bg-secondary text-primary-foreground">
            <span className="text-sm font-medium text-primary/60 mr-2">●</span>
            <span className="text-sm font-medium">Live Feed</span>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</CardTitle>
              <div className="p-2 bg-background rounded-lg group-hover:bg-slate-100 transition-colors">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center mt-1 text-[10px] font-bold text-primary/80">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-foreground">Statistik Pertumbuhan Platform</h3>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map(t => (
                <button key={t} className={`px-3 py-1 rounded-md text-xs font-bold ${t === '30D' ? 'bg-primary/80 text-primary-foreground' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full bg-background rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
            <div className="text-center text-slate-300">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Grafik akan dimuat di sini</p>
            </div>
          </div>
        </Card>

        {/* Top Tenants */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-secondary text-primary-foreground">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60">Top Performing Tenants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { name: "Coffee Shop A", revenue: "Rp 150M", growth: "+12%" },
              { name: "Fashion Store B", revenue: "Rp 120M", growth: "+8%" },
              { name: "Gadget Hub", revenue: "Rp 95M", growth: "+15%" },
              { name: "Bakery & Co", revenue: "Rp 88M", growth: "+5%" },
              { name: "Auto Clean", revenue: "Rp 72M", growth: "+20%" },
            ].map((tenant, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-background transition-colors">
                <div>
                  <p className="text-sm font-bold text-foreground">{tenant.name}</p>
                  <p className="text-[10px] text-slate-500">Premium Subscription</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{tenant.revenue}</p>
                  <p className="text-[10px] font-bold text-primary/80">{tenant.growth}</p>
                </div>
              </div>
            ))}
            <div className="p-4">
              <button className="w-full py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
                Lihat Semua Tenant
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
