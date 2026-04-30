# 🚀 Master Checklist Implementasi SaaS ERP & AI Tumbuhin
*Panduan Eksekusi Step-by-Step (Dirancang khusus untuk Junior Programmer & AI Assistant agar tidak terjadi error)*

**Instruksi Penting Sebelum Eksekusi:**
- Jangan lompati tahapan. Selesaikan Fase 1 sebelum masuk ke Fase 2.
- Saat membuat fitur akuntansi, pastikan `Debit == Kredit`.
- Jangan biarkan AI LLM memanggil database secara langsung tanpa melalui *Aggregation/Semantic Layer*.

---

## 🛠️ FASE 1: ARSITEKTUR EVENT-DRIVEN & DATABASE CORE (Backend) (DONE 🚀)
- [x] **1.1. Modifikasi Skema Tenant (Feature Flagging)**
- [x] **1.2. Buat Tabel Business Event Core**
- [x] **1.3. Buat Tabel Accounting Core**
- [x] **1.4. Seeding Data Standar COA**

## 🔐 FASE 2: MONETIZATION & OPERATIONAL FRICTION (Backend, Web, Mobile) (DONE 🚀)
- [x] **2.1. Backend Guard (Tier Middleware)**
- [x] **2.2. Eksekusi Operational Friction (Tier 1)**
- [x] **2.3. Lock Fitur ERP (Tier 1)**

## 💸 FASE 3: DOUBLE-ENTRY ACCOUNTING AUTOMATION (Backend) (DONE 🚀)
- [x] **3.1. Buat Accounting Service**
- [x] **3.2. Hook Transaksi Penjualan Normal**
- [x] **3.3. Hook Retur & Diskon**
- [x] **3.4. Pembuatan Laporan Berjenjang (Materialized View)**

## 🤖 FASE 4: UX UPSELL & PROGRESSIVE REVELATION (Web & Mobile) (DONE 🚀)
- [x] **4.1. Pembuatan Komponen Blurred Insight**
- [x] **4.2. Pemasangan di Dashboard Utama**

## 🧠 FASE 5: THE AI FINANCIAL BRAIN & MEMORY LAYER (Backend) (DONE 🚀)
- [x] **5.1. Buat Semantic Layer (Aggregator)**
- [x] **5.2. Pembuatan Business Memory Layer**
- [x] **5.3. Integrasi Gemini API (Reasoning)**
- [x] **5.4. Eksekusi Autopilot Mode (Pro ERP Tier 3)**

## 🧪 FASE 6: TESTING & VALIDATION TAHAP 1 (DONE 🚀)
- [x] Uji Double-Entry & Operational Friction
- [x] Uji Semantic Layer AI

---
> **BAGIAN DI BAWAH INI ADALAH FASE PLATFORM PARITY (WEB & MOBILE PENYEMPURNAAN)**
---

## 💻 FASE 7: WEB POS IMPLEMENTATION (Web Frontend) (DONE 🚀)
- [x] **7.1. Buat Struktur Layout Kasir (POS) Web**
- [x] **7.2. Implementasi Logika Keranjang (Cart State)**
- [x] **7.3. Integrasi Checkout ke Backend**
- [x] **7.4. Fungsi Ekspor/Cetak Struk Web**

## 💬 FASE 8: OMNI-CHANNEL AI CHAT (Web, Mobile, Backend) (DONE 🚀)
- [x] **8.1. API Controller Chat Interaktif**
- [x] **8.2. Floating Widget Chat (Web)**
- [x] **8.3. Full-Screen Chat UI (Mobile App)**

## 📊 FASE 9: LAPORAN FINANSIAL KOMPREHENSIF (Web Frontend) (DONE 🚀)
- [x] **9.1. Buat Tabel Buku Besar (Ledger UI)**
- [x] **9.2. Halaman Neraca Keuangan (Balance Sheet)**
- [x] **9.3. Halaman Arus Kas (Cash Flow)**

## 📦 FASE 10: ADVANCED PROCUREMENT & DOCUMENT BUILDER (Web Frontend) (DONE 🚀)
- [x] **10.1. Halaman Tinjauan Draft AI**
- [x] **10.2. Document Builder (PO Editor)**
- [x] **10.3. Ekspor Dokumen Resmi (PDF)**

## 🧪 FASE 11: FINAL END-TO-END TESTING
- [ ] **Tes Web POS:** Lakukan simulasi penjualan kasir di Web Dashboard, pastikan laporan laba rugi di web langsung berubah dalam hitungan detik (berkat *Materialized Views*).
- [ ] **Tes AI Chatbot:** Coba tanyakan pertanyaan kompleks seperti *"Apakah ada indikasi fraud minggu ini?"* melalui Web Widget dan Mobile App secara bergantian, pastikan *history* obrolan sinkron atau respon akurat.
- [ ] **Tes PO Autopilot & Ekspor:** Set secara manual stok satu barang ke 5 (low stock), jalankan secara paksa fungsi *cron* Autopilot, lalu pastikan draf muncul di menu Procurement Web dan bisa dicetak sebagai PDF.

## ⚙️ FASE 12: DETERMINISTIC CORE LOGIC & UI POLISH (Backend, Web, App)
*Tujuan: Memastikan semua "otak" bisnis berjalan secara matematis dan logis tanpa bergantung pada AI. AI hanya bertindak sebagai asisten interaksi UI.*

- [ ] **12.1. Deterministic Procurement (Backend)**
  - **Aksi:** Buat `ProcurementCronService` (`@nestjs/schedule`). Job ini akan mendeteksi `current_stock <= minimum_stock` dan membuat `procurement_draft` di `business_memory` dengan rumus matematis statis tanpa memanggil LLM.
- [ ] **12.2. Deterministic Analytics Refresh (Backend)**
  - **Aksi:** Buat `AnalyticsCronService` yang memanggil `REFRESH MATERIALIZED VIEW CONCURRENTLY` setiap jam agar data Laba Rugi dan Neraca selalu update.
- [ ] **12.3. Hardcoded RBAC & Staff Management (Backend & UI)**
  - **Aksi:** Lengkapi tabel `staff_accounts`, sesuaikan otentikasi JWT untuk menolak role `cashier` mengakses rute `/api/finance`. 
  - **Aksi UI:** Buat UI "Manajemen Staf" di Web dan Mobile App.
- [ ] **12.4. Deterministic Promo Engine (Backend & UI)**
  - **Aksi:** Buat modul Promotions di Backend dan integrasikan ke kalkulasi Keranjang (`Cart`) Web POS & Mobile POS agar diskon terpotong otomatis berdasarkan persentase.
- [ ] **12.5. Frontend to Backend API Routing (Refactoring)**
  - **Aksi:** Pindahkan semua fungsi `supabase.from(...)` yang ada di komponen Frontend (seperti `BalanceSheetPage`, `CashFlowPage`, `ProcurementDraftsPage`, dll) menjadi *fetch API* ke endpoint NestJS Backend (`/api/finance/balance-sheet`, `/api/procurement/drafts`). Frontend sama sekali tidak boleh menembak database secara langsung.
- [ ] **12.6. UI/UX Polish (Web & App)**
  - **Aksi Web:** Percantik halaman yang masih terlihat kaku, perbaiki navigasi antar modul.
  - **Aksi App:** Pastikan modal AI Chat merespon secara instan dengan indikator loading yang elegan.
