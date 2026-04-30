# 📋 REVIEW LENGKAP PROYEK: Tumbuhin SaaS ERP & AI Platform

**Tanggal Review:** 30 April 2026  
**Reviewer:** Deep Code Audit  
**Cakupan:** Seluruh codebase (`app/`, `backend/`, `web/`), strategi bisnis, arsitektur, fitur, alur kerja, tiering, dan platform.

---

## 1. GAMBARAN UMUM PROYEK

**Tumbuhin** adalah platform SaaS terpadu yang dirancang untuk mendigitalkan operasional bisnis UMKM Indonesia. Platform ini mencakup:
- **Point of Sale (POS)** untuk transaksi kasir
- **Manajemen Inventaris** multi-gudang
- **Akuntansi Double-Entry** otomatis berbasis Chart of Accounts (COA)
- **Procurement (SO/PO)** untuk rantai pasok
- **AI Assistant** sebagai "CFO Virtual" untuk analisis keuangan

**Visi:** "Upload kwitansi → Otomatis jadi jurnal akuntansi" dengan Business Health Score dan COA adaptif.

**Filosofi Arsitektur Terbaru:** Semua logika bisnis kritis berjalan secara **deterministik** (matematis murni) di backend. AI hanya digunakan sebagai antarmuka komunikasi untuk menyederhanakan kompleksitas data bagi pengguna.

---

## 2. ARSITEKTUR TEKNIS

### 2.1 Struktur Monorepo (3 Pilar)

```
tumbuhin/
├── app/          → 📱 Mobile POS (React Native / Expo)
├── backend/      → ⚙️ API Server (NestJS / TypeScript)
└── web/          → 💻 Web Dashboard (Next.js 14 / Tailwind / Shadcn UI)
```

### 2.2 Tech Stack

| Layer | Teknologi |
|---|---|
| **Mobile App** | React Native (Expo), NativeWind, Zustand (state) |
| **Web Dashboard** | Next.js 14 (App Router), Tailwind CSS, Shadcn UI |
| **Backend API** | NestJS (TypeScript), BullMQ (queue), Passport (auth) |
| **Database & Auth** | Supabase (PostgreSQL + JWT Auth + RLS) |
| **AI Engine** | Google Gemini 1.5 Flash (OCR, Chat, Forecasting) |
| **Payment** | Midtrans (Withdrawal/Payout) |
| **Logging** | Pino (structured logging with trace ID) |
| **Scheduling** | `@nestjs/schedule` (Cron Jobs) |

### 2.3 Pola Arsitektur yang Digunakan

| Pola | Implementasi |
|---|---|
| **Modular Monolith** | 14 modul NestJS terpisah (`sales`, `accounting`, `ai`, `procurement`, dll) |
| **Clean Architecture** | Pemisahan `controllers/`, `services/`, `repositories/`, `domain/` per modul |
| **Event-Driven** | `EventBusService` + BullMQ queue (`event-processor-queue`) untuk domain events |
| **Unit of Work** | `UnitOfWork` class dengan PostgreSQL `BEGIN/COMMIT/ROLLBACK` untuk transaksi atomik |
| **CQRS** | `@nestjs/cqrs` terdaftar di `AppModule` |
| **Domain Model** | `JournalEntry.validateBalance()` sebagai invariant bisnis |
| **Guard Chain** | `AuthGuard` → `TierGuard` → `RoleGuard` secara global |

---

## 3. BACKEND: 14 MODUL NESTJS

### 3.1 Daftar Modul

| # | Modul | Fungsi |
|---|---|---|
| 1 | `accounting` | Double-entry engine, jurnal, OCR controller, finance API, analytics cron |
| 2 | `ai` | Chat AI (Gemini), scan receipt, forecasting, aggregator, memory (RAG) |
| 3 | `business-profile` | Profil tenant, payout/withdrawal, admin panel, staff management |
| 4 | `erp` | Fitur ERP lanjutan |
| 5 | `insight` | Smart alerts & business insight |
| 6 | `inventory` | Manajemen stok, resep produk, deduct stock |
| 7 | `onboarding` | Registrasi tenant baru, setup COA otomatis |
| 8 | `order` | Sales Order (SO) & Purchase Order (PO) |
| 9 | `procurement` | Cron job restok otomatis, API draft PO |
| 10 | `promo` | CRUD promosi, `applyPromotions()` deterministik |
| 11 | `recovery` | Pemulihan data/transaksi |
| 12 | `report` | Dashboard summary, laporan akuntansi |
| 13 | `sales` | Proses penjualan POS dengan double-entry otomatis |
| 14 | `warehouse` | Multi-gudang, transfer stok |

### 3.2 Core Infrastructure (`backend/src/core/`)

| Direktori | Isi |
|---|---|
| `auth/` | `supabase.strategy.ts`, `tier.guard.ts`, `tier.decorator.ts`, `tier.enum.ts`, `role.guard.ts`, `role.decorator.ts` |
| `events/` | `EventBusService` (persist ke `event_log` + push ke BullMQ) |
| `database/` | `UnitOfWork` (PostgreSQL transaction wrapper) |
| `middlewares/` | `IdempotencyMiddleware`, `TraceIdMiddleware` |
| `interceptors/` | Response formatting |
| `exceptions/` | Custom exception filters |
| `ai/` | `GeminiProvider` (wrapper Google Generative AI SDK) |

### 3.3 Alur Kerja Transaksi Penjualan (SalesService)

Ini adalah alur paling kritis di sistem — setiap penjualan POS melewati pipeline berikut:

```
[POS Checkout] → SalesService.processSale()
  │
  ├─ 1. Cek Limit Transaksi (Tier Starter = max 500/bulan)
  │
  ├─ 2. UnitOfWork.runInTransaction() ← PostgreSQL ACID
  │   │
  │   ├─ 3. Buat record transaksi (status: VALIDATING)
  │   │
  │   ├─ 4. Loop setiap item:
  │   │   ├─ Ambil produk + resep bahan baku
  │   │   ├─ Hitung HPP (unit_price × quantity_needed × qty)
  │   │   └─ Deduct stok bahan baku (atomik)
  │   │
  │   ├─ 5. Auto-lookup akun COA by kode:
  │   │   ├─ 1-10000 Kas Tangan
  │   │   ├─ 4-40000 Penjualan
  │   │   ├─ 5-50000 HPP
  │   │   ├─ 1-10503 Persediaan
  │   │   └─ 4-41000 Diskon (jika ada)
  │   │
  │   ├─ 6. Rakit journal lines (Debit/Kredit)
  │   │
  │   ├─ 7. AccountingService.createJournalEntry()
  │   │   └─ Validasi: Math.abs(totalDebit - totalCredit) > 0.01 → ERROR
  │   │
  │   ├─ 8. Simpan sale_items
  │   │
  │   └─ 9. EventBusService.emit('SaleCreated')
  │       ├─ Persist ke event_log
  │       └─ Push ke BullMQ queue
  │
  └─ Return { journalId, status: 'COMMITTED' }
```

### 3.4 Sistem Keamanan Berlapis

```
Request masuk
  │
  ├─ Layer 1: AuthGuard (Supabase JWT verification)
  │   └─ Memastikan token valid, inject user.id ke request
  │
  ├─ Layer 2: TierGuard (Subscription tier check)
  │   └─ Ambil tenant.tier dari DB, bandingkan dengan @RequireTier()
  │   └─ Inject user.tenant_id, user.tier, user.role ke request
  │
  └─ Layer 3: RoleGuard (RBAC check)
      └─ Bandingkan user.role dengan @Roles() decorator
      └─ Tolak jika cashier akses /api/finance
```

---

## 4. DATABASE & MIGRASI

### 4.1 Tabel-Tabel Utama (7 Migrasi)

| Migrasi | Tabel yang Dibuat |
|---|---|
| **Tahap 1** | `warehouses`, `stock_transfers`, `stock_transfer_items`, `stock_opnames`, `stock_opname_items`, `purchase_orders`, `sales_orders`, `promotions`, `tenant_metrics_cache`, `smart_alerts`, `sale_items` |
| **Tahap 2** | `chart_of_accounts` (COA standar) |
| **Tahap 3** | `journal_entries`, `journal_lines` |
| **Tahap 4** | `business_memory` (RAG layer) |
| **Tahap 5** | `ledger_balances` (view), `monthly_profit_loss` (view) |
| **Tahap 6** | Konversi ke Materialized Views + fungsi `refresh_ledger_analytics()` |
| **Tahap 7** | `staff_accounts` (RBAC), kolom `role` di `profiles` |

### 4.2 Skema Subscription

```sql
CREATE TYPE subscription_tier AS ENUM ('free', 'business', 'ai');
-- Kolom di tabel tenants:
-- tier, subscription_status, subscription_end_date
```

### 4.3 Row Level Security (RLS)

Semua tabel baru telah diaktifkan RLS. Backend menggunakan **Service Role Key** (bypass RLS) untuk operasi server-side, sementara query dari sisi client tetap dibatasi oleh policy tenant-based.

---

## 5. PLATFORM: WEB DASHBOARD (Next.js)

### 5.1 Routing Structure

```
web/src/app/
├── (auth)/          → Login, Register
├── (marketing)/     → Landing page publik
├── admin/           → Super Admin panel
└── tenant/          → Dashboard Tenant (dilindungi auth)
    ├── page.tsx           → Dashboard utama (metrik bisnis)
    ├── pos/               → Web POS (Kasir berbasis web)
    ├── inventory/         → Manajemen produk & stok
    ├── orders/            → Sales/Purchase Order
    ├── finance/
    │   ├── balance-sheet/ → Neraca Keuangan
    │   ├── cash-flow/     → Arus Kas
    │   └── (ledger)       → Buku Besar
    ├── procurement/
    │   └── drafts/        → Draft PO dari Autopilot
    ├── marketing/
    │   └── promos/        → Manajemen Promo & Diskon
    ├── settings/
    │   └── staff/         → Manajemen Staf (RBAC)
    ├── withdrawal/        → Penarikan dana (Midtrans)
    └── onboarding/        → Setup bisnis baru
```

### 5.2 Komponen Kunci

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `ChatWidget` | `components/ai/` | Floating AI chat widget (CFO Virtual) |
| `DocumentBuilder` | `components/procurement/` | Editor PO dengan ekspor PDF |
| POS Components | `components/pos/` | Katalog produk, keranjang, checkout |
| Finance Components | `components/finance/` | Tabel neraca, arus kas |
| Shadcn UI | `components/ui/` | Button, Card, Table, Input, Badge, dll |

### 5.3 API Layer Web

```
web/src/lib/api/
├── orderService.ts    → CRUD order via backend REST API
└── (inline fetch)     → Finance & procurement via /api/v1/finance/*, /api/v1/procurement/*
```

Semua data finance dan procurement kini diambil melalui **backend REST API** (bukan langsung ke Supabase). Token JWT dikirim via header `Authorization: Bearer`.

---

## 6. PLATFORM: MOBILE APP (Expo React Native)

### 6.1 Navigasi & Layar

```
app/app/
├── login.tsx              → Autentikasi (Supabase Auth)
├── settings.tsx           → Pengaturan akun & bisnis
├── (tabs)/
│   ├── chat.tsx           → POS Kasir + Chat interaktif
│   ├── inventory.tsx      → Manajemen produk & stok
│   └── reports.tsx        → Laporan finansial (9 tab)
├── inventory/             → Detail inventori
├── orders/                → Pesanan
├── promos/                → Promosi
└── staff/                 → Manajemen staf
```

### 6.2 Tab Laporan di Mobile (reports.tsx)

Layar reports memiliki **2 mode**:
1. **Summary View:** Kartu ringkasan (Laba Bersih, Omset, Beban, Rasio, Smart Alerts)
2. **Full Report View:** 7 tab detail:

| Tab | Komponen | Data |
|---|---|---|
| Jurnal | `JournalTab` | Daftar entri jurnal |
| Buku Besar | `LedgerTab` | Saldo per akun COA |
| Neraca Saldo | `TrialBalanceTab` | Trial balance |
| Penjualan | `SalesReport` | Riwayat transaksi |
| Laba Rugi | `ProfitLossReport` | Income statement |
| Stok | `StockReport` | Status inventori |
| Neraca | `BalanceSheetReport` | Balance sheet |

### 6.3 API Layer Mobile

```
app/src/api/
├── supabase.ts          → Supabase client init
├── posService.ts        → Produk & transaksi POS
├── inventoryService.ts  → CRUD inventori
├── reportService.ts     → Dashboard, accounts, income statement, balance sheet, cash flow
├── aiService.ts         → Chat AI
├── journalService.ts    → Jurnal akuntansi
├── profileService.ts    → Profil & tenant
└── adminService.ts      → Admin operations
```

### 6.4 State Management

- **Zustand** (`useAuthStore`, `useGuestStore`) untuk state global (user session, guest mode)
- **React hooks** (`useReportsData`) untuk data fetching per-screen

---

## 7. SISTEM AI: ARSITEKTUR & PERAN

### 7.1 Prinsip Utama: AI Sebagai Alat Bantu, Bukan Pengambil Keputusan

Setelah refaktorisasi deterministik, AI **tidak lagi** menjalankan logika bisnis kritis. Perannya:
- ✅ **Merangkum** data keuangan yang kompleks ke bahasa manusia
- ✅ **Menjawab** pertanyaan pengguna tentang kondisi bisnisnya
- ✅ **Memindai** kwitansi (OCR) untuk dijadikan draft jurnal
- ❌ **Tidak** menentukan berapa stok yang harus dibeli
- ❌ **Tidak** menghitung laba rugi atau neraca
- ❌ **Tidak** mengeksekusi transaksi keuangan

### 7.2 Komponen AI di Backend

| Service | Fungsi |
|---|---|
| `GeminiProvider` | Wrapper SDK Google Generative AI untuk `generateContent()` dan `extractReceipt()` |
| `AggregatorService` | Mengambil data `ledger_balances` dan merangkumnya ke JSON semantik (PnL snapshot, liquidity snapshot) |
| `MemoryService` | Menyimpan dan mengambil konteks bisnis dari `business_memory` (RAG) |
| `ForecastingService` | Menggabungkan data agregasi + memori historis → prompt ke Gemini → simpan insight |
| `AiController` | Endpoint `/api/v1/ai/chat` (Business+) dan `/api/v1/ai/scan-receipt` (Pro) |

### 7.3 Alur Chat AI

```
User bertanya "Bagaimana kondisi keuangan saya?"
  │
  ├─ AiController.chat()
  │   ├─ Jika prompt kosong → ForecastingService.generateFinancialInsight()
  │   │   ├─ AggregatorService.getSemanticFinancialSummary()
  │   │   │   └─ Query ledger_balances → JSON { revenue, gross_profit, net_profit, cash, inventory }
  │   │   ├─ MemoryService.getRelevantMemories()
  │   │   │   └─ Query business_memory → pola historis
  │   │   ├─ Bangun CFO Prompt → Gemini.generateContent()
  │   │   └─ Simpan insight ke business_memory
  │   │
  │   └─ Jika ada prompt → Gemini.generateContent(systemContext + userPrompt)
  │
  └─ Return { response: "Analisis AI..." }
```

---

## 8. TIERING & MONETISASI

### 8.1 Hierarki 3 Tier

| Aspek | Tier 1: Starter (Rp 99k) | Tier 2: Business (Rp 249k) | Tier 3: Pro ERP (Rp 499k) |
|---|---|---|---|
| **POS** | Transaksi dasar, kas/QRIS | + Split bill, multi-payment | + Void & refund approval |
| **Inventori** | 1 gudang, produk dasar | + Multi-gudang, transfer stok | + PO/SO, opname, expiry |
| **Promo** | Harga dasar | + Promo engine otomatis | + Pricing bertingkat |
| **Staf** | Owner only (1 user) | + RBAC (Kasir/Manajer) | + Audit log |
| **Akuntansi** | Laporan pendapatan | + Laba rugi, jurnal otomatis | + Neraca, arus kas, ledger |
| **AI** | Whisper (notifikasi 1 kalimat) | + Assistant (chat analitik) | + Analyst (prediksi & aksi) |
| **Limit** | 500 transaksi/bulan, 7 hari histori | 1 tahun histori | Tanpa batas |
| **Ekspor** | Tidak bisa ekspor | CSV | CSV + PDF + API |

### 8.2 Enforcement di Kode

- **Backend:** `TierGuard` membaca `tenant.tier` dari DB, membandingkan dengan `@RequireTier()` decorator
- **Enum:** `SubscriptionTier.STARTER | BUSINESS | PRO`
- **Contoh:** `@RequireTier(SubscriptionTier.PRO)` di endpoint `/api/v1/finance/balance-sheet`
- **Operational Friction (Tier 1):** Limit 500 transaksi/bulan dicek di `SalesService.processSale()`

### 8.3 Progressive Revelation (UX Upsell)

Strategi konversi menggunakan pola **Tease → Hook → Unlock**:
- **Blurred Insight:** Tier 1 melihat insight AI yang di-blur, memancing upgrade
- **Ghost UI:** Tier 2 melihat bayangan tombol "Buat PO Otomatis" yang mengarahkan ke upgrade Pro

---

## 9. CRON JOBS DETERMINISTIK

### 9.1 ProcurementCronService

| Aspek | Detail |
|---|---|
| **Jadwal** | Setiap tengah malam (`EVERY_DAY_AT_MIDNIGHT`) |
| **Logika** | Query `products WHERE current_stock <= 5` per tenant |
| **Output** | Insert `procurement_draft` ke `business_memory` |
| **Tanpa AI** | Tidak memanggil LLM — murni query SQL + matematis |

### 9.2 AnalyticsCronService

| Aspek | Detail |
|---|---|
| **Jadwal** | Setiap jam (`EVERY_HOUR`) |
| **Logika** | Memanggil `refresh_ledger_analytics()` PostgreSQL function |
| **Output** | Materialized views `ledger_balances` dan `monthly_profit_loss` diperbarui |

---

## 10. ALUR KERJA UTAMA (END-TO-END FLOWS)

### 10.1 Alur Registrasi & Onboarding

```
1. User daftar via Supabase Auth (email/password)
2. OnboardingController menerima profil bisnis
3. Backend auto-seed Chart of Accounts (30+ akun standar)
4. Tenant dibuat dengan tier default 'free'
5. User masuk ke dashboard
```

### 10.2 Alur Penjualan POS (Web & Mobile)

```
1. Kasir buka POS → pilih produk → masukkan ke keranjang
2. Sistem cek promo aktif → PromoService.applyPromotions() → potong harga otomatis
3. Kasir klik Checkout → POST /api/v1/sales
4. SalesService: validasi stok → deduct stok → rakit jurnal double-entry → commit
5. EventBusService: emit 'SaleCreated' → persist event_log → BullMQ
6. Struk bisa dicetak (web: window.print(), mobile: bluetooth printer)
```

### 10.3 Alur Procurement Otomatis

```
1. Tengah malam: ProcurementCronService berjalan
2. Scan semua tenant → cari produk dengan stok rendah
3. Rakit draft PO (vendor, items, qty, estimasi harga)
4. Simpan ke business_memory (tipe: procurement_draft)
5. Pagi hari: Owner buka web → /tenant/procurement/drafts
6. Review draft → edit jika perlu → approve → jadi Purchase Order resmi
7. Ekspor ke PDF via DocumentBuilder
```

### 10.4 Alur Laporan Keuangan

```
1. Setiap jam: AnalyticsCronService refresh Materialized Views
2. User buka /tenant/finance/balance-sheet
3. Frontend fetch GET /api/v1/finance/balance-sheet (dengan JWT)
4. FinanceController query ledger_balances WHERE tenant_id = user.tenant_id
5. Data ditampilkan di tabel interaktif
```

---

## 11. KEKUATAN SISTEM (STRENGTHS)

1. **Arsitektur Deterministik:** Semua keputusan bisnis (stok, promo, akuntansi) berjalan dengan logika matematis pasti — tidak ada risiko halusinasi AI.
2. **Double-Entry Accounting:** Setiap transaksi dijaga oleh `JournalEntry.validateBalance()` dan `AccountingService` — Debit selalu sama dengan Kredit.
3. **Unit of Work:** Transaksi penjualan berjalan di dalam PostgreSQL transaction (`BEGIN/COMMIT/ROLLBACK`) — tidak ada data setengah jadi.
4. **Event-Driven:** Setiap aksi bisnis menghasilkan domain event yang persisten di `event_log` — audit trail lengkap.
5. **Keamanan 3 Lapis:** JWT → Tier → Role — tidak mungkin kasir menembus laporan neraca.
6. **Platform Parity:** Web dan Mobile memiliki fitur setara, keduanya mengonsumsi API backend yang sama.
7. **AI yang Bertanggung Jawab:** AI tidak bisa mengubah data — hanya membaca agregasi dan merangkum.

---

## 12. KELEMAHAN & REKOMENDASI (WEAKNESSES)

### 12.1 Masalah yang Teridentifikasi

| # | Masalah | Severity | Detail |
|---|---|---|---|
| 1 | **Bug di AiChatModal** | 🔴 High | Baris 75: `</div>` seharusnya `</View>` (React Native, bukan HTML) |
| 2 | **Tier enum mismatch** | 🟡 Medium | Database enum: `'free','business','ai'` vs Kode: `STARTER, BUSINESS, PRO` — perlu disinkronkan |
| 3 | **SalesService import path** | 🟡 Medium | Import `SubscriptionTier` dari `../../core/auth/tier.enum` tapi path seharusnya `../../../core/auth/tier.enum` |
| 4 | **Promo page direct Supabase** | 🟡 Medium | `marketing/promos/page.tsx` masih menggunakan `supabase.from('promotions')` langsung |
| 5 | **Missing Promo Controller route** | 🟡 Medium | `PromoController` ada tapi belum tervalidasi apakah `/api/v1/promo/apply` endpoint tersedia untuk POS checkout |
| 6 | **Cash flow transform mismatch** | 🟡 Medium | Backend mengembalikan `chart_of_accounts` tapi frontend transform menggunakan field name berbeda |
| 7 | **Missing inventory module in AppModule** | 🟡 Medium | `InventoryModule` tidak terdaftar di `app.module.ts` imports |

### 12.2 Rekomendasi Perbaikan

1. **Fix bug `</div>` di AiChatModal.tsx** — ganti ke `</View>`
2. **Sinkronkan enum tier** — ubah database ke `'starter','business','pro'` atau sesuaikan kode
3. **Pindahkan query Supabase terakhir** di `promos/page.tsx` ke backend API
4. **Buat endpoint `/api/v1/promo/apply`** yang dipanggil oleh POS saat checkout
5. **Tambahkan `InventoryModule`** ke imports di `AppModule`
6. **End-to-End Testing (Fase 11)** — uji alur penjualan → jurnal → laporan secara penuh

---

## 13. RINGKASAN STATUS PROYEK

| Fase | Status |
|---|---|
| Fase 1: Arsitektur Event-Driven & DB Core | ✅ Selesai |
| Fase 2: Monetization & Operational Friction | ✅ Selesai |
| Fase 3: Double-Entry Accounting | ✅ Selesai |
| Fase 4: UX Upsell & Progressive Revelation | ✅ Selesai |
| Fase 5: AI Financial Brain & Memory Layer | ✅ Selesai |
| Fase 6: Testing & Validation Tahap 1 | ✅ Selesai |
| Fase 7: Web POS Implementation | ✅ Selesai |
| Fase 8: Omni-Channel AI Chat | ✅ Selesai |
| Fase 9: Laporan Finansial Komprehensif | ✅ Selesai |
| Fase 10: Advanced Procurement & Document Builder | ✅ Selesai |
| Fase 11: Final End-to-End Testing | ⬜ Belum |
| Fase 12: Deterministic Core Logic & UI Polish | ✅ Selesai |

**Kesimpulan:** Proyek Tumbuhin telah menyelesaikan **11 dari 12 fase**. Satu-satunya yang tersisa adalah **Fase 11 (Final E2E Testing)** — yaitu pengujian integrasi penuh dari ujung ke ujung untuk memastikan semua komponen bekerja harmonis di lingkungan production.
