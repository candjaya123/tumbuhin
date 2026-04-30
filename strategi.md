# Tumbuhin: SaaS Product & AI Strategy (3-Tier Model)

**Disusun oleh:** Senior SaaS Product Architect & Growth Strategist  
**Tujuan:** Transformasi sistem Tumbuhin dari aplikasi POS+ERP standar menjadi platform komersial SaaS berbasis AI (*AI-First SaaS*) dengan fokus pada monetisasi tingkat konversi (*conversion rate*) tinggi.

---

## A. ANALISIS SISTEM SAAT INI (GAP ANALYSIS)

Sistem Tumbuhin saat ini memiliki arsitektur fitur (POS, Inventory, Multi-Warehouse, Procurement, RBAC, Accounting, Promo) yang kuat secara teknikal, namun belum dirancang untuk **monetisasi berjenjang** dan belum memiliki **otak AI di backend**. 

**Pemetaan Ulang Fitur:**
1.  **Tier 1 (Starter POS):** Fitur kompleks harus *dipotong* atau dikunci. Hanya menyisakan POS transaksi dasar, katalog produk, dan laporan ringkas.
2.  **Tier 2 (Business):** Fitur seperti Multi-Warehouse, Promo Engine, RBAC menengah, dan Basic Accounting dipindahkan ke sini.
3.  **Tier 3 (Pro ERP):** Fitur kelas kakap seperti Procurement (SO/PO), Multi-Payment lanjutan, dan Audit Log dikunci secara eksklusif untuk tier tertinggi.

**Gap Utama Saat Ini:**
*   **Ketiadaan Paywall/Feature Flagging:** Belum ada sistem yang secara dinamis memblokir akses *route* atau tombol berdasarkan *Subscription ID* aktif.
*   **Data Readiness untuk AI:** Data masih bersifat transaksional murni (OLTP). Belum ada *Aggregation Layer* yang secara periodik merangkum data agar bisa "dibaca" dengan cepat oleh LLM tanpa membuat *database* lambat.
*   **AI Masih UI/UX Mockup:** Fitur AI di aplikasi saat ini baru berupa *placeholder* antarmuka, belum tersambung dengan eksekusi *prompt* LLM di sisi backend.

---

## B. DESAIN 3-TIER FINAL SYSTEM

Sistem ini menghilangkan *Free Tier* untuk menyaring pengguna yang berniat serius berbisnis. Semua tier menggunakan AI sebagai *Unique Selling Proposition* (USP).

### 1. TIER 1: Starter POS + AI Teaser (Estimasi Harga: Rp 99.000 / bulan)
*   **Positioning:** Kasir digital andal untuk UMKM pemula yang tidak punya waktu mereka rekap penjualan.
*   **Fitur Core (Non-AI):**
    *   **Point of Sale (POS) Standar:** Pencatatan transaksi *real-time*, hitung kembalian otomatis, penerimaan pembayaran kas & QRIS Statis, opsi cetak struk via *bluetooth printer* atau kirim struk *softcopy* via WhatsApp.
    *   **Katalog & Inventori Sederhana:** Manajemen daftar produk (CRUD), varian produk dasar, peringatan stok habis secara visual di layar POS, pemotongan stok otomatis dari transaksi. Terbatas hanya untuk 1 lokasi/gudang.
    *   **Laporan Ringkas:** Dashboard metrik omset harian & mingguan, serta daftar riwayat transaksi (terbatas akses data historis 30 hari terakhir).
    *   **Akses Pengguna:** 1 Akun (Owner/Kasir digabung), *login* multi-perangkat dimungkinkan namun tanpa pemisahan riwayat aktivitas staf.
*   **Fitur AI (Level Depth - AI Whisper):** Inteligensi pasif. AI hanya memberikan notifikasi 1 kalimat (*micro insight*). Contoh: "Penjualan hari ini naik 12%."
*   **Limitation (Operational Friction Lock):** Bukan sekadar potong fitur, tapi menambahkan gesekan (*friction*) operasional yang halus untuk memicu *upgrade*:
    *   Tidak bisa *export* data laporan (hanya *view* di layar).
    *   Pencarian riwayat transaksi dibatasi maksimal 7 hari ke belakang.
    *   Tidak bisa mengedit transaksi yang sudah selesai (sangat dibatasi).
    *   Sinkronisasi data *multi-device* tidak bersifat *real-time* (ada *delay* 15 menit), sehingga tidak cocok untuk toko dengan antrean panjang.
*   **Psychological Trigger:** Menimbulkan rasa **penasaran**. Menggunakan sistem *Progressive Revelation* (Tease -> Hook -> Unlock).

### 2. TIER 2: Business + AI Assistant (Estimasi Harga: Rp 249.000 / bulan)
*   **Positioning:** Solusi ritel/F&B berkembang yang membutuhkan "Asisten Manajer Virtual" siap sedia 24/7.
*   **Fitur Core (Non-AI):**
    *   *(Termasuk semua fitur Tier 1)*
    *   **Multi-Warehouse & Stock Transfer:** Manajemen banyak lokasi fisik/gudang, kartu stok (*stock card*) detail per barang, alur pemindahan stok antar-gudang secara terstruktur.
    *   **Dynamic Promo Engine:** Pembuatan aturan diskon (Persentase, Nominal, *Beli X Gratis Y*) dengan batas waktu dan minimal belanja. *Smart cart* di POS secara otomatis mendeteksi dan memotong harga.
    *   **RBAC & Manajemen Staf:** Pemisahan akses berbasis peran (Owner, Manajer, Kasir, Staf Gudang), fitur *QR Join* untuk kemudahan *login* staf, dan jejak aktivitas dasar.
    *   **Multi-Payment & Split Bill:** Penerimaan 1 nota dengan berbagai metode bayar sekaligus (misal: 50% Tunai, 50% QRIS), dan pembagian tagihan transaksi.
    *   **Basic Accounting Engine:** Penjurnalan ganda otomatis (*double-entry*) di balik layar setiap transaksi selesai. Menyediakan Laporan Laba Rugi Dasar. (Penyimpanan histori data hingga 1 Tahun).
*   **Fitur AI (Level Depth - AI Assistant):** Analitik deskriptif dan dialog interaktif. *User* bisa *chat* dengan AI untuk meminta penjelasan data (*"Tampilkan grafik produk terlaris minggu ini dan rincian keuntungannya"*).
*   **Limitation (Lock System):** Tidak bisa memprediksi masa depan (*forecasting*), mendeteksi *fraud*, dan tidak ada modul Procurement (PO/SO).
*   **Psychological Trigger:** Menimbulkan **kebutuhan otomatisasi**. AI memberitahu stok bahan baku habis saat ditanya, tapi *user* masih harus mengetik pesanan secara manual ke *supplier*.

### 3. TIER 3: Pro ERP + AI Analyst (Estimasi Harga: Rp 499.000 / bulan)
*   **Positioning:** ERP otonom komprehensif layaknya memiliki *Data Analyst* dan *Purchasing Officer* sungguhan.
*   **Fitur Core (Non-AI):**
    *   *(Termasuk semua fitur Tier 2)*
    *   **Procurement & SCM (SO/PO):** Manajemen rantai pasok penuh. *Document builder* untuk menerbitkan *Purchase Order* (PO) ke vendor dan *Sales Order* (SO) B2B lengkap dengan ekspor PDF siap kirim.
    *   **Advanced Accounting & Keuangan:** Neraca Keuangan (*Balance Sheet*) lengkap, Hutang Piutang (AP/AR), Manajemen Kas Kecil (*Petty Cash*).
    *   **Advanced Inventory:** Fitur *Stock Opname* (Audit Fisik), serta pelacakan spesifik via *Batch Number* dan Tanggal Kadaluarsa (*Expiry Date*) untuk manajemen retur barang kedaluwarsa.
    *   **Approval & Restitusi:** Manajemen *Void* & *Refund* kompleks yang memerlukan otorisasi manajer dengan *Audit Log* level tinggi.
    *   **Enterprise Access:** Akses API Kustom (untuk webhook/integrasi pihak ke-3), Ekspor Excel laporan analitik tanpa batas, dan Data Historis Tanpa Batas Waktu.
*   **Fitur AI (Level Depth - AI Analyst):** Penalaran prediktif dan aksi mandiri. AI memprediksi tren permintaan bulan depan, mendeteksi anomali (*fraud*/pembatalan nota mencurigakan), dan mampu *generate draft* dokumen PO secara otomatis ketika menembus ambang batas stok.

---

## C. DESAIN AI STRATEGY (TINGKATAN KECERDASAN)

AI bukan sekadar fitur *chatbot* tambahan, melainkan anggota tim yang "naik pangkat" seiring peningkatan tier *user*.

### 🧠 The Core Moat: "Business Memory Layer"
Agar AI tidak terasa seperti ChatGPT *stateless* biasa, sistem harus memiliki **Memory Layer** yang secara persisten mengingat konteks bisnis *user*. Tanpa ini, AI hanya *chatbot*; dengan ini, AI adalah *Digital Business Brain*.
*   **Sales Pattern Memory:** Mengingat hari apa saja toko ramai dan jam berapa puncaknya.
*   **Product Behavior Memory:** Mengingat siklus hidup produk (kapan biasanya produk A harus direstok sebelum *weekend*).
*   **Seasonal Pattern Memory:** Mengingat tren hari libur, cuaca, atau momen gajian bulanan.
*   **Cashier Behavior Memory (Tier 3):** Mempelajari pola *void* atau diskon dari kasir tertentu untuk deteksi *fraud*.

### 1. AI Whisper (Tier 1) - Pasif & Memancing
*   **Output:** Notifikasi (Push / Banner) yang sangat singkat.
*   **Locked:** Detail "Mengapa" (*Why*) dan "Bagaimana" (*How*).
*   **Mekanisme Upgrade:** Menyadarkan *user* bahwa ada pola tersembunyi di tokonya yang tidak mereka ketahui. 

### 2. AI Assistant (Tier 2) - Deskriptif & Menjelaskan
*   **Output:** Antarmuka *Chat POS* yang bisa menjawab pertanyaan berbasis data masa lalu dan masa kini. AI merangkum data dan menggambar grafik instan.
*   **Locked:** Rekomendasi masa depan (*What's next*) dan eksekusi otomatis.
*   **Mekanisme Upgrade:** Saat *user* bertanya "Berapa banyak bahan baku yang harus saya beli besok?", AI menjawab: *"Sebagai AI Assistant, saya hanya menganalisa data saat ini. Upgrade ke Tier Pro agar saya bisa memprediksi kebutuhan stok Anda minggu depan secara presisi."*

### 3. AI Analyst (Tier 3) - Proaktif, Prediktif & Bertindak
*   **Output:** Pemikiran (*Reasoning*), Prediksi, dan Eksekusi.
*   **Kemampuan Inti:**
    *   **Anomaly Detection:** *"Bos, ada 3 transaksi yang dibatalkan kasir (void) malam ini pada jam sibuk, ini pola yang mencurigakan."*
    *   **Forecasting & Action:** *"Stok Biji Kopi akan habis lusa karena tren akhir pekan. Saya sudah membuatkan draft Purchase Order (PO) ke Supplier A. Ingin saya kirim sekarang via email?"*
*   **🔥 The Ultimate USP: "AI Business Autopilot Mode"**
    *   AI tidak hanya menjawab atau memprediksi, tapi **mengambil tindakan terbatas**.
    *   *Auto-propose price adjustment:* Menyarankan kenaikan harga 2% pada jam sibuk (*dynamic pricing*).
    *   *Auto-propose promo campaign:* Merakit draf diskon *bundling* untuk stok yang menumpuk.
    *   *Auto-suggest closing action harian:* Menyarankan uang tunai yang harus disetor vs ditahan untuk kembalian besok.

---

## D. DESAIN “AI TEASER LOOP” (UX UPSELL)

Strategi pertumbuhan (*Growth*) mengandalkan *loop* UX yang memicu FOMO (*Fear of Missing Out*) dan efisiensi waktu.

**Mekanisme UX: "Progressive Revelation System"**
Alih-alih sekadar *paywall* kaku, kita menggunakan alur 3 tahap untuk mengonversi *user*:
1.  **Tease:** Memberikan separuh *insight* berharga.
2.  **Hook:** Memberikan alasan logis mengapa sisa informasinya dikunci.
3.  **Unlock CTA:** Memberikan alasan *upgrade* yang sangat spesifik dan menguntungkan.

*   **Contoh Implementasi di Tier 1 (The Blurred Insight):**
    *   **Tease (Teks Terbaca):** *"Produk Kopi Susu Aren menurunkan margin Anda sebesar 15% minggu ini..."*
    *   **Hook (Teks di-Blur):** *[...karena pola diskon berlebih di jam 2 siang...]*
    *   **Unlock CTA:** 💎 *"Lihat 3 produk penyebab terbesar kerugian Anda (Upgrade ke Business)"*

*   **Contoh Tampilan di Tier 2 (Saat stok habis):**
    *   **Teks AI:** *"Stok Kopi Susu Aren tersisa 5 cup. Segera pesan ke supplier."*
    *   **UX Tambahan:** Muncul bayangan (*ghost UI*) tombol *"Buat PO Otomatis"*, yang ketika ditekan memunculkan pop-up: *"Di Tier Pro, saya bisa menghitung rasio pembelian yang paling murah dan membuatkan dokumen PO resmi ke supplier Anda dalam 1 detik. Ingin mencoba?"*

---

## E. SAAS ARCHITECTURE IMPLICATIONS

Untuk mengeksekusi strategi komersial ini tanpa membuat aplikasi lambat (*scalable*), arsitektur teknis harus dirubah:

1.  **🧱 "Business Event Core" (Event-Driven Architecture):**
    *   Sistem tidak boleh hanya mengubah baris di *database*. **Semua** harus melewati model *Event*.
    *   *Contoh Event:* `transaction_created`, `stock_updated`, `refund_requested`, `purchase_order_created`.
    *   **Kenapa ini kritis?** Karena AI tidak boleh membaca *database* transaksional secara langsung. AI harus mendengarkan *event layer* & *summary layer* ini agar *real-time AI analytics* bisa di-*scale* ke ribuan *tenant* tanpa *crash*.
2.  **Aggregation Layer (OLAP):**
    *   Buat tabel agregat berkala (misal: Cron job tiap jam merekap `daily_sales_summary`, `stock_movement_summary`). LLM **hanya** diizinkan membaca tabel ringkasan ini untuk menghemat token dan mempercepat *response time*.
3.  **Semantic / Tooling Layer untuk AI:**
    *   Sistem AI (Gemini) tidak membaca *database* SQL langsung. AI akan menggunakan *Function Calling* (Tools) untuk meminta data spesifik (misal memanggil fungsi `get_sales_trends()`).
4.  **Enforcement Fitur (Feature Flagging):**
    *   Gunakan mekanisme JWT *Token Claim* saat login. *Payload* sesi pengguna harus memuat `tier: 'starter' | 'business' | 'pro'`. Setiap komponen UI dan Endpoint API wajib divalidasi melalui *TierGuard* (NestJS) atau *Middleware* (Next.js) untuk mencegah peretasan tingkat *frontend*.

---

## F. OUTPUT AKHIR & ROADMAP IMPLEMENTASI

### 1. Final Feature Distribution Table
| Modul | Tier 1: Starter (99k) | Tier 2: Business (249k) | Tier 3: Pro ERP (499k) |
| :--- | :--- | :--- | :--- |
| **Kasir & Pembayaran** | POS, Kas/QRIS | + Split Bill, Multi-Payment | + Void & Refund Approval |
| **Manajemen Inventori** | 1 Gudang, Produk | + Multi-Gudang, Transfer | + PO/SO, Opname, Expiry |
| **Pemasaran** | Harga Dasar | + Promo Engine, Diskon | + Pricing Bertingkat / Grosir |
| **Kolaborasi & Staf** | Owner Only (1 User) | + RBAC Dasar (Kasir/Manajer) | + Audit Log, Limit Akses API |
| **Akuntansi** | Laporan Pendapatan | + Buku Besar, Jurnal Otomatis | + Neraca Keuangan Penuh |
| **Kapasitas AI** | AI Whisper (Alert) | + AI Assistant (Chat Analitik) | + AI Analyst (Prediksi & Aksi) |

### 2. Rekomendasi Prioritas Eksekusi (Roadmap Teknikal)

*   **Fase 1: Feature Flagging & Lock System (Minggu 1)**
    *   Implementasikan modifikasi pada skema `profiles/tenants` di Supabase untuk menampung kolom `subscription_tier`.
    *   Buat *Guard/Interceptor* di backend dan *Middleware* di frontend untuk mengunci rute (misal: menu Transfer Gudang disembunyikan/dikunci bagi *user* Tier 1).
*   **Fase 2: The Data Aggregation (Minggu 2)**
    *   Buat *cron-job* atau *Materialized Views* di Supabase PostgreSQL yang merekap total penjualan dan stok per jam/hari. Ini adalah bahan makanan untuk AI.
*   **Fase 3: Basic AI Wiring & The UI Teaser (Minggu 3)**
    *   Sambungkan API Gemini ke backend NestJS.
    *   Desain antarmuka *Blurred Insight* di Web Dashboard.
*   **Fase 4: RAG & Agentic AI Workflow (Minggu 4)**
    *   Lengkapi fungsi *Chat POS* di aplikasi *mobile* agar AI bisa mengeksekusi *Function Calling* (mencari data omset, melihat status stok nyata) sebagai *AI Assistant* untuk pengguna Tier 2 dan Tier 3.

---

## G. ACCOUNTING SYSTEM & AI FINANCIAL BRAIN ARCHITECTURE

**Tujuan:** Mengintegrasikan mesin akuntansi *double-entry* berskala *Enterprise* berbasis *Chart of Accounts* (COA) sebagai fondasi kecerdasan AI dalam model 3-Tier SaaS Tumbuhin.

### G.1 INTEGRASI KE TIER SYSTEM (Monetisasi Akuntansi)
Akuntansi adalah urat nadi bisnis. Dalam SaaS, data keuangan adalah "sandera" positif yang membuat *user* tidak bisa pindah ke kompetitor (*high switching cost*). 

*   **Tier 1 (Starter POS):** **TIDAK ADA** akses ke sistem akuntansi. Transaksi hanya dicatat sebagai *revenue* tunggal di *dashboard*.
*   **Tier 2 (Business - Accounting-Enabled System):** 
    *   Sistem secara otomatis membuat jurnal di belakang layar (Kas, Penjualan, HPP, Persediaan).
    *   *User* mendapatkan akses ke Laporan Laba Rugi Dasar (*Income Statement*) dan Arus Kas Masuk/Keluar.
    *   **Locked:** Tidak bisa membuat Jurnal Manual, tidak ada akses ke Neraca (*Balance Sheet*), Hutang/Piutang (AP/AR), dan Buku Besar (*Ledger*).
*   **Tier 3 (Pro ERP - Financial Truth + AI Brain):**
    *   *Full Unlock* sistem ERP akuntansi.
    *   Akses penuh ke Neraca, Buku Besar, Trial Balance, Hutang/Piutang (AP/AR), *Petty Cash*, dan Prive.
    *   AI berperan sebagai *Financial Analyst* yang membedah COA untuk mendeteksi *fraud* dan memprediksi kebangkrutan (*runway* kas).

### G.2 DOUBLE-ENTRY DESIGN (Otomatisasi Jurnal POS)
Setiap aksi kasir/staf adalah *Event* yang memicu sistem untuk mencatat 2 jurnal (Debit & Kredit) secara seimbang berdasarkan COA *Standard Retail*.

**1. Penjualan Normal (Split Payment: Tunai & QRIS)**
*Konteks: Jual barang seharga Rp100.000 (HPP Rp60.000), dibayar Tunai Rp40.000, QRIS Rp60.000.*
*   **(Dr)** 1-10000 Kas Tangan ................. Rp 40.000
*   **(Dr)** 1-10003 E-Wallet (QRIS) .......... Rp 60.000
*   **(Cr)** 4-40000 Penjualan Produk ..................... Rp 100.000
*   **(Dr)** 5-50000 Harga Pokok Penjualan .. Rp 60.000
*   **(Cr)** 1-10503 Persediaan Barang Dagang ........ Rp 60.000

**2. Penjualan dengan Diskon Promo**
*Konteks: Promo diskon 10% (Harga normal Rp100.000 jadi Rp90.000).*
*   **(Dr)** 1-10000 Kas Tangan ................. Rp 90.000
*   **(Dr)** 4-41000 Diskon Penjualan ......... Rp 10.000 *(Kontra Revenue)*
*   **(Cr)** 4-40000 Penjualan Produk ..................... Rp 100.000
*   *(Diikuti jurnal HPP & Persediaan seperti di atas)*

**3. Retur Penjualan (Void / Pengembalian Barang)**
*Konteks: Pelanggan mengembalikan barang rusak Rp100.000.*
*   **(Dr)** 4-41001 Retur Penjualan ............ Rp 100.000 *(Kontra Revenue)*
*   **(Cr)** 1-10000 Kas Tangan ................................. Rp 100.000
*   **(Dr)** 1-10503 Persediaan Barang Dagang .. Rp 60.000
*   **(Cr)** 5-50000 Harga Pokok Penjualan ............ Rp 60.000

**4. Pembelian Stok (Procurement - Hutang / PO)**
*Konteks: Beli barang dari supplier Rp5.000.000, Tempo 30 Hari.*
*   **(Dr)** 1-10503 Persediaan Barang Dagang .. Rp 5.000.000
*   **(Cr)** 2-20100 Hutang Usaha ............................... Rp 5.000.000

**5. Pembayaran Hutang Supplier**
*Konteks: Transfer ke supplier untuk pelunasan hutang via Bank.*
*   **(Dr)** 2-20100 Hutang Usaha ............... Rp 5.000.000
*   **(Cr)** 1-10002 Kas Bank ..................................... Rp 5.000.000

**6. Pengeluaran Operasional (Gaji/Beban)**
*Konteks: Bayar listrik (Utility) Rp500.000 pakai uang di laci kasir.*
*   **(Dr)** 6-60200 Biaya Utility .................. Rp 500.000
*   **(Cr)** 1-10000 Kas Tangan ................................. Rp 500.000

**7. Penambahan Modal Tambahan (Investor/Owner)**
*Konteks: Owner suntik dana Rp10.000.000 ke Bank.*
*   **(Dr)** 1-10002 Kas Bank ..................... Rp 10.000.000
*   **(Cr)** 3-30000 Modal .......................................... Rp 10.000.000

**8. Prive (Penarikan Uang oleh Owner)**
*Konteks: Owner ambil uang kasir Rp1.000.000 untuk pribadi.*
*   **(Dr)** 3-31000 Prive ................................ Rp 1.000.000 *(Kontra Ekuitas)*
*   **(Cr)** 1-10000 Kas Tangan ................................. Rp 1.000.000

### G.3 ACCOUNTING ENGINE ARCHITECTURE (Database Layer)
Untuk memastikan performa *real-time* tanpa *lock* database, arsitekturnya berjenjang:

1.  **Business Event Layer (`events` table):** Menerima payload JSON dari POS (misal: `checkout_success`).
2.  **Journal Table (`journal_entries` & `journal_lines`):** *Event listener* memecah *Event* menjadi baris Debit/Kredit. Tabel ini *immutable* (tidak bisa di-UPDATE/DELETE, hanya bisa dijurnal balik/reversal untuk menjaga *Audit Trail*).
3.  **Ledger Aggregation (`ledger_balances`):** Materialized view atau Redis yang menampung saldo berjalan per COA (Total Debit & Total Kredit). Dihitung ulang secara asinkron (misal tiap jam).
4.  **Trial Balance & Financial Statements:** Mesin pembaca yang menarik saldo akhir dari `ledger_balances` untuk disusun menjadi Laba Rugi (grup 4, 5, 6) dan Neraca (grup 1, 2, 3).

### G.4 AI INTEGRATION (The Financial Brain - Tier 3)
LLM tidak membaca raw transaksi. LLM membaca **Agregasi COA Bulanan/Mingguan** yang dipasok oleh *Aggregation Layer*.

*   **1. Profit Reasoning (Mengapa Untung/Rugi?):**
    *   *Prompt Input:* AI membaca rasio (Akun 5-50000 + 6-xxxx) vs (Akun 4-40000).
    *   *AI Output:* "Margin kotor Anda bagus (40%), tapi laba bersih minus karena **Beban Marketing (6-60300)** meroket 300% dibanding bulan lalu tanpa kenaikan **Penjualan (4-40000)** yang sepadan."
*   **2. Anomaly & Fraud Detection:**
    *   *Prompt Input:* AI mendeteksi lonjakan rasio **Diskon Penjualan (4-41000)** dan **Retur (4-41001)** terhadap total Penjualan, diiris berdasarkan ID Kasir.
    *   *AI Output:* 🚨 "Waspada: Kasir Budi mencatat **Retur Penjualan (4-41001)** senilai Rp 2 Juta pada shift malam minggu berturut-turut. Ini adalah pola *void fraud* yang umum. Segera audit stok fisik harian."
*   **3. Cashflow Runway & Forecasting:**
    *   *Prompt Input:* Kecepatan pengeluaran kas (Burn rate di grup 6) dibandingkan total liquid asset (**1-10000, 1-10002**).
    *   *AI Output:* "Uang tunai di Kas Bank (1-10002) Anda saat ini Rp15 Juta. Dengan beban gaji (6-60100) dan sewa (6-60400) tetap, Anda akan kehabisan kas dalam 45 hari jika tidak melunasi **Piutang Usaha (1-10300)**."

### G.5 TIER DIFFERENTIATION & UX MONETIZATION (Keuangan)
**Kenapa User Tier 2 Akan Upgrade ke Tier 3?**
*   **Blind Spot Piutang & Hutang:** Di Tier 2, mereka tahu bisnis *untung* (karena melihat Laba Rugi), tapi bingung kenapa "uang di laci tidak ada". Mereka butuh **Neraca & Arus Kas (Tier 3)** untuk melihat bahwa uangnya nyangkut di *Piutang Usaha (1-10300)* atau habis untuk bayar *Hutang (2-20100)*.
*   **Fraud Paranoia:** Teaser di Tier 2: *"AI mendeteksi anomali pada rasio Diskon Anda bulan ini..."* (Blur). Mereka akan *upgrade* ke Tier 3 untuk mengetahui apakah kasir mereka mencuri melalui celah *void/discount*.

**Final Capability Comparison (Akuntansi):**
| Modul Akuntansi | Tier 2 (Business) | Tier 3 (Pro ERP) |
| :--- | :--- | :--- |
| **Pencatatan** | Otomatis POS ke Laba/Rugi | Otomatis + Jurnal Manual |
| **Standard COA** | Tersembunyi (Sistem Kelola) | Akses Penuh (Bisa Tambah/Edit Akun) |
| **Laporan Keuangan**| Laba Rugi (Pemasukan vs Beban) | Laba Rugi, Neraca, Arus Kas Kas, Trial Balance |
| **Manajemen Kas** | Transaksi Kasir Dasar | Kas Kecil (Petty Cash), Prive, Rekonsiliasi Bank |
| **Aset & Hutang** | Tidak Tersedia | Manajemen Hutang (AP) & Piutang (AR) |
| **Peran AI** | Asisten Chat (Tanya Omset) | Financial Analyst (Deteksi Fraud, Prediksi Runway Kas) |

### G.6 REKOMENDASI IMPLEMENTASI TEKNIS BERTAHAP (Engineering Blueprint)
1.  **Fase 1: Seed COA & Jurnal Statis**
    *   Buat tabel `chart_of_accounts` dan masukkan 30+ daftar COA standar saat *tenant* baru melakukan registrasi.
    *   Buat tabel `journal_entries` dan `journal_lines`.
2.  **Fase 2: The Double-Entry Webhook**
    *   Intersep (*Hook*) proses `CheckoutModal.tsx` di mobile dan API `orders`.
    *   Setiap kali ada status `COMPLETED`, panggil fungsi backend `generateSalesJournal(orderId)` yang otomatis memotong saldo Kas, Penjualan, HPP, dan Persediaan.
3.  **Fase 3: Materialized Views untuk Laporan**
    *   Tulis *query* PostgreSQL view untuk menghitung Laba Rugi (Sum akun 4 dikurangi Sum akun 5 & 6) agar dasbor Laporan Keuangan tidak berat.
4.  **Fase 4: Financial AI Semantic Layer**
    *   Buat format JSON statis yang ditarik dari *View* Laba Rugi.
    *   *Feed* JSON ini ke *System Prompt* Gemini: *"Kamu adalah analis keuangan. Ini saldo COA perusahaan X bulan ini. Cari anomali di akun Retur (4-41001) dan Beban (6-xxxxx)."*

---

## H. PLATFORM PARITY STRATEGY (WEB & MOBILE)

**Tujuan:** Memastikan bahwa Tumbuhin tidak hanya bergantung pada aplikasi *mobile*. Pengguna (*tenant*) harus dapat menjalankan seluruh operasional bisnisnya (dari kasir hingga analisa AI) secara eksklusif melalui Web Dashboard jika mereka memilih untuk tidak menggunakan *smartphone* atau tablet Android/iOS.

### 1. Web POS (Kasir Berbasis Web)
*   **Kebutuhan:** Membangun antarmuka kasir yang responsif di web untuk mengakomodasi bisnis yang menggunakan PC Desktop atau laptop.
*   **Fitur Wajib:** Manajemen *cart*, input produk cepat (barcode scanner support), integrasi dengan *Accounting Engine* untuk penjurnalan otomatis, dan kemampuan cetak struk (via *browser print*).

### 2. Omni-Channel AI Chat (Web & App)
*   **Kebutuhan:** *AI Assistant* dan *AI Analyst* tidak boleh hanya eksklusif di *mobile app*. 
*   **Fitur Wajib:** Implementasi komponen antarmuka *Chatroom* interaktif yang terhubung ke API Gemini (via backend) di kedua platform. Pengguna web dapat menekan ikon "Tanya AI" di pojok layar untuk berdiskusi dengan CFO Virtual mereka.

### 3. Laporan Finansial Komprehensif
*   **Kebutuhan:** Fitur Tier 3 (Pro ERP) seperti Neraca Keuangan (*Balance Sheet*), Arus Kas (*Cash Flow*), dan Jurnal Manual harus dibangun UI-nya di Web Dashboard, karena Web adalah medium utama bagi analis keuangan atau akuntan perusahaan untuk bekerja.

### 4. Advanced Procurement UI (Web)
*   **Kebutuhan:** Karena *Autopilot Mode* (AI) bekerja merakit *Draft PO* di belakang layar, Web Dashboard harus memiliki UI *Document Builder* yang mumpuni agar pengguna dapat meninjau, mengedit, mengotorisasi, dan mengirim dokumen PO/SO tersebut ke vendor dalam bentuk PDF.
