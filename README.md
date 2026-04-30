# 🚀 Tumbuhin - SaaS ERP & Intelligent Accounting Platform

![Tumbuhin Banner](https://via.placeholder.com/1200x400/FDB827/ffffff?text=Tumbuhin+ERP+Platform)

Tumbuhin adalah platform **SaaS Enterprise Resource Planning (ERP)** terpadu yang dirancang untuk mendigitalkan dan mengotomatiskan operasional bisnis UMKM, mulai dari Point of Sales (POS), manajemen inventaris multi-gudang, pengadaan (procurement), hingga pencatatan akuntansi (*double-entry bookkeeping*) yang didukung oleh kecerdasan buatan (AI).

Visi utama dari Tumbuhin adalah **"Upload kwitansi → Otomatis jadi jurnal akuntansi"** dengan fitur *Business Health Score* dan sistem operasional yang sepenuhnya tersentralisasi dan deterministik.

---

## 🏗️ Arsitektur Sistem (Deterministic Modular Monolith)

Tumbuhin menggunakan arsitektur **Modular Monolith** dengan pendekatan **Clean Architecture** dan logika inti berbasis **Deterministik**. Arsitektur ini memastikan sistem *future-proof*, mudah di-*scale*, dan bebas dari risiko halusinasi AI pada transaksi finansial kritis.

*   **💻 Web Dashboard (Admin & Tenant)**: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI
*   **📱 Mobile App (POS & Scanner)**: React Native (Expo) + NativeWind + Zustand
*   **⚙️ Backend API**: NestJS (TypeScript) + BullMQ + PostgreSQL Unit of Work
*   **🗄️ Database & Auth**: Supabase (PostgreSQL + JWT Auth + Row Level Security)
*   **🧠 AI Engine**: Google Gemini 1.5 Flash (Read-Only Insights & OCR)
*   **💳 Payment Gateway**: Midtrans (Withdrawal & Payouts)

---

## 📂 Struktur Direktori Utama

Proyek ini menggunakan struktur monorepo yang memisahkan tanggung jawab (Seperation of Concerns) menjadi 3 pilar utama:

```text
tumbuhin/
├── backend/           # ⚙️ NestJS - Sentralisasi Logika Bisnis & Transaksi (Source of Truth)
│   ├── src/
│   │   ├── core/      # Core infrastructure (Auth, Guards, Interceptors, Event Bus)
│   │   ├── modules/   # 14 Feature Modules (Sales, Accounting, Inventory, AI, dll)
│   │   └── shared/    # Shared Services (Supabase Client, External APIs)
│   └── package.json
│
├── web/               # 💻 Next.js - Web Dashboard (Management & Reporting)
│   ├── src/
│   │   ├── app/       # Next.js App Router (/(auth), /admin, /tenant)
│   │   ├── components/# Reusable UI Components (Shadcn, Custom POS/Finance widgets)
│   │   └── lib/       # API Clients (Fetch logic to NestJS Backend)
│   └── package.json
│
└── app/               # 📱 React Native (Expo) - Aplikasi Mobile POS & Dashboard
    ├── src/
    │   ├── api/       # API Integration Layer
    │   ├── features/  # Feature-based components (POS, Inventory, Reports)
    │   └── store/     # Zustand state management
    ├── app.json       # Expo configuration
    └── package.json
```

---

## 🛡️ Fitur Utama & Tier Sistem

Sistem ini menggunakan mekanisme Role-Based Access Control (RBAC) dan Subscription Tiers untuk membatasi akses fitur.

### **3-Tier Subscription Model**
1. **Starter (Free)**: POS dasar, 1 gudang, maksimal 500 transaksi/bulan.
2. **Business**: Multi-gudang, Manajemen Promo Otomatis, Manajemen Staf (RBAC), Laporan Laba Rugi, AI Chat Analytics.
3. **Pro (ERP)**: Pengadaan Otomatis (Autopilot Procurement), Neraca Keuangan (Balance Sheet), Arus Kas (Cash Flow), AI OCR Scanner.

### **Core Modules**
*   **Deterministic POS**: Sistem kasir yang secara otomatis memotong stok berdasarkan resep (BOM) dan membuat jurnal ganda (Debit/Kredit) secara real-time dan transaksional.
*   **Double-Entry Accounting**: Menggunakan `JournalEntry.validateBalance()` untuk memastikan keakuratan akuntansi 100%. Laporan dihasilkan otomatis melalui `Materialized Views` yang di-refresh berkala.
*   **Autopilot Procurement**: Cronjob NestJS mendeteksi stok yang menipis dan membuat draf Purchase Order secara otomatis.
*   **CFO Virtual (AI)**: Asisten cerdas yang menganalisis agregasi keuangan (`business_memory`) untuk memberikan saran strategi tanpa akses modifikasi data.

---

## 🛠️ Prasyarat (Prerequisites)

Pastikan mesin Anda telah menginstal:
1.  **Node.js** (v18.x atau v20.x direkomendasikan)
2.  **npm** (atau Yarn/pnpm)
3.  **Supabase CLI** (Opsional untuk testing lokal)
4.  **Expo CLI** (`npm install -g eas-cli`)
5.  Akun **Supabase** (Proyek cloud) & **Google AI Studio** (Gemini API Key)
6.  **Redis** (Untuk BullMQ Message Queue di Backend)

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Lakukan langkah-langkah berikut secara berurutan:

### 1. Setup Backend API (NestJS)
Backend **wajib** dijalankan pertama kali karena Web dan Mobile bergantung penuh pada REST API ini.

```bash
cd backend
npm install
cp .env.example .env
```

**Konfigurasi `.env` Backend:**
```env
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJh..." # Wajib Service Role Key
SUPABASE_JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="AIzaSy..." 
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

**Jalankan Server:**
```bash
npm run start:dev
# Backend beroperasi di http://localhost:3000
```

### 2. Setup Web Dashboard (Next.js)

```bash
cd web
npm install
cp .env.example .env.local
```

**Konfigurasi `.env.local` Web:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..." # Anon Key
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

**Jalankan Web:**
```bash
npm run dev
# Web beroperasi di http://localhost:3001
```

### 3. Setup Mobile App (Expo)

```bash
cd app
npm install
# Konfigurasi di file .env
```

**Konfigurasi `.env` Mobile:**
```env
EXPO_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
EXPO_PUBLIC_BACKEND_URL="http://[IP-LOKAL-ANDA]:3000" # Wajib IP Lokal (misal 192.168.1.x) jika testing di HP fisik
```

**Jalankan Mobile:**
```bash
npx expo start
```

---

## 🧠 Aturan Pengembangan (PENTING!)

Bagi pengembang yang akan berkontribusi, wajib mematuhi aturan berikut untuk menjaga stabilitas dan keamanan arsitektur:

1.  **API Centralization**: Client (Web & Mobile) **TIDAK BOLEH** melakukan operasi penulisan (INSERT/UPDATE/DELETE) langsung ke Supabase (kecuali autentikasi dasar). Seluruh operasi CRUD dan logika bisnis **WAJIB** melalui REST API NestJS (`/api/v1/...`).
2.  **Deterministic First**: Jangan menggunakan AI/LLM untuk menghitung stok, menentukan harga, atau menjurnal akuntansi. AI hanya bertindak sebagai *interface* (UX) untuk ekstraksi teks (OCR) dan merangkum insight.
3.  **ACID Transactions**: Setiap transaksi POS yang memotong stok dan membuat jurnal **harus** dibungkus dalam `UnitOfWork.runInTransaction()` untuk mencegah data parsial jika terjadi kegagalan.
4.  **Guards Pipeline**: Selalu gunakan dekorator keamanan berlapis pada rute Backend: `@UseGuards(JwtAuthGuard)`, `@RequireTier(SubscriptionTier.X)`, dan `@Roles(UserRole.X)`.

---

## 🧪 Testing

Sistem ini dilengkapi dengan Master Test Case (lihat `test.md`). Untuk menjalankan tes lokal:

```bash
cd backend
npm run test
npm run test:e2e
```

---
*Dibangun untuk merevolusi operasional UMKM Indonesia.* 🇮🇩
