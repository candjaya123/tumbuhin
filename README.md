# 🚀 Tumbuhin - SaaS POS & Intelligent Accounting Platform

Tumbuhin adalah platform terpadu (SaaS) yang dirancang untuk mendigitalkan dan mengotomatiskan operasional bisnis UMKM, mulai dari Point of Sales (POS), manajemen inventaris, hingga pencatatan akuntansi (*double-entry bookkeeping*) yang didukung oleh kecerdasan buatan (AI).

Visi utama dari Tumbuhin adalah **"Upload kwitansi → Otomatis jadi jurnal akuntansi"** dengan fitur *Business Health Score* dan Chart of Accounts (COA) yang adaptif berdasarkan profil bisnis (Retail, Jasa, Manufaktur).

---

## 🏗️ Arsitektur Sistem (Modular Monolith)

Tumbuhin menggunakan arsitektur **Modular Monolith** dengan pola **Clean Architecture** untuk memastikan sistem *future-proof*, mudah di- *scale*, dan terhindar dari *vendor lock-in*.

*   **📱 Mobile App (POS & Scanner)**: React Native (Expo) + NativeWind
*   **💻 Web Dashboard (Admin & Tenant)**: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI
*   **⚙️ Backend API**: NestJS (TypeScript)
*   **🗄️ Database & Auth**: Supabase (PostgreSQL + JWT Auth + RLS)
*   **🧠 AI Engine**: Google Gemini 1.5 Flash (untuk OCR & Categorization)
*   **💳 Payment Gateway**: Midtrans (untuk penarikan dana/Withdrawal)

---

## 📂 Struktur Direktori Proyek

Proyek ini menggunakan struktur monorepo-style (walaupun tanpa workspace manager khusus) yang terbagi menjadi tiga pilar utama:

```text
tumbuhin/
├── app/               # 📱 React Native (Expo) - Aplikasi Mobile POS
│   ├── src/           # Source code (API, Components, Screens)
│   ├── supabase/      # Supabase local setup & SQL Migrations (Master DB Schema)
│   └── app.json       # Expo config
│
├── backend/           # ⚙️ NestJS - Sentralisasi Business Logic & AI
│   ├── src/
│   │   ├── core/      # Core infrastructure (AI Interfaces, Auth Strategy, Exceptions)
│   │   ├── modules/   # Feature Modules (Accounting, Sales, Inventory, Business Profile)
│   │   └── shared/    # Shared Services (Supabase Client)
│   └── package.json
│
└── web/               # 💻 Next.js - Web Dashboard (Superadmin & Tenant)
    ├── src/
    │   ├── app/       # Next.js App Router (/(auth), /admin, /tenant)
    │   ├── components/# Reusable UI Components
    │   └── lib/       # Utility functions & Supabase clients
    └── package.json
```

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan proyek ini, pastikan mesin Anda telah terinstal perangkat lunak berikut:

1.  **Node.js** (versi 18.x atau 20.x disarankan)
2.  **npm** (atau Yarn/pnpm)
3.  **Supabase CLI** (untuk menjalankan migrasi & lokal DB)
4.  **Expo CLI** (`npm install -g eas-cli`)
5.  Akun **Google AI Studio** (untuk mendapatkan *API Key* Gemini)

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan Tumbuhin di mesin lokal Anda.

### 1. Setup Database (Supabase)

Proyek ini mengandalkan Supabase. Anda dapat menggunakan Supabase lokal (Docker) atau menggunakan *project* Supabase di *cloud*.

```bash
# Masuk ke direktori app (tempat konfigurasi Supabase berada)
cd app/supabase

# Jalankan semua file SQL di dalam folder migrations/ secara berurutan pada database Supabase Anda.
# File migrasi terakhir (20260427000001 & 20260427000002) sangat penting untuk arsitektur NestJS.
```

### 2. Menjalankan Backend API (NestJS)

Backend bertindak sebagai *Single Source of Truth* untuk semua *business logic* yang kompleks (HPP, Jurnal, AI).

```bash
cd backend

# Install dependensi
npm install

# Buat file .env
cp .env.example .env
```

**Konfigurasi `.env` Backend:**
```env
SUPABASE_URL="https://[PROJECT-ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJh..." # Gunakan Service Role Key untuk operasi backend!
SUPABASE_JWT_SECRET="secret-jwt-dari-supabase"
GEMINI_API_KEY="AIzaSy..." # Dapatkan dari Google AI Studio
```

**Jalankan Backend:**
```bash
npm run start:dev
# Backend akan berjalan di http://localhost:3000
```

### 3. Menjalankan Web Dashboard (Next.js)

```bash
cd web

# Install dependensi
npm install

# Buat file .env.local
cp .env.example .env.local
```

**Konfigurasi `.env.local` Web:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

**Jalankan Web:**
```bash
npm run dev
# Web berjalan di http://localhost:3001
```

### 4. Menjalankan Mobile App (React Native/Expo)

```bash
cd app

# Install dependensi
npm install

# Konfigurasi .env (Pastikan ada)
# EXPO_PUBLIC_SUPABASE_URL="..."
# EXPO_PUBLIC_SUPABASE_ANON_KEY="..."
# EXPO_PUBLIC_BACKEND_URL="http://[IP-LOCAL-PC]:3000" # Gunakan IP lokal jika ditest di HP fisik

# Jalankan aplikasi
npx expo start
```

---

## 🧠 Konsep Kunci Sistem (PENTING!)

Agar tidak merusak arsitektur yang sudah dibangun, perhatikan aturan utama berikut:

1.  **No Database Logic**: JANGAN PERNAH menambahkan *business logic* (seperti potong stok, hitung HPP, atau insert jurnal ganda) menggunakan **PostgreSQL RPC atau Triggers** lagi. Semua logika **WAJIB** ditulis di lapisan `Service` pada backend **NestJS**.
2.  **Double-Entry Validator**: Semua entri jurnal akuntansi diawasi oleh `JournalEntry.validateBalance()` di layer *Domain* NestJS. Pastikan total Debit selalu sama dengan total Kredit.
3.  **Human-in-the-Loop AI**: OCR (Gemini) tidak langsung memposting jurnal ke buku besar. Hasil OCR akan masuk ke *Draft Transaction Layer* (`is_draft = true`). Pengguna (manusia) wajib melakukan validasi akhir di aplikasi sebelum jurnal tersebut diposting secara permanen.
4.  **Shadow Deployment**: Jika Anda sedang memigrasikan fitur *legacy* dari RPC ke API NestJS, pastikan rute API sudah dites secara paralel sebelum fitur RPC di aplikasi *Mobile/Web* dimatikan.

---

## 🗺️ Roadmap & Hal yang Belum Selesai

Jika Anda pengembang baru yang mengambil alih proyek ini, berikut adalah daftar tugas selanjutnya:

*   [ ] **Sinkronisasi UI Web**: Implementasikan halaman fungsional untuk `/tenant/pos` dan `/tenant/inventory` di *Web Dashboard* yang saat ini masih berupa *placeholder*.
*   [ ] **Laporan Akuntansi Lengkap**: Bangun modul pelaporan di NestJS untuk men-*generate* Laporan Laba Rugi, Neraca, dan Arus Kas berdasarkan tabel `journal_entries`.
*   [ ] **AI Business Health Score**: Implementasikan prompt AI generatif yang membaca ringkasan Laba Rugi dan memberikan rekomendasi strategis ke pengguna.

---
*Dikompilasi untuk memastikan transisi *engineering* yang mulus menuju visi SaaS yang skalabel.* 🚀
