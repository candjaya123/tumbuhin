-- =============================================================
-- 🚀 MIGRASI TAHAP 3: AI BUSINESS MEMORY & AGGREGATION
-- =============================================================

-- 1. TASK 5.1: Pembuatan Tabel Business Memory (RAG Context)
CREATE TABLE IF NOT EXISTS business_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) NOT NULL, -- sales_pattern, product_behavior, seasonal_trend, cashier_behavior
    context_key VARCHAR(255) NOT NULL, -- e.g., "peak_hours", "low_stock_frequency"
    memory_data JSONB NOT NULL,
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, context_key)
);

-- 2. Tambahkan Index untuk Performa Pencarian AI
CREATE INDEX IF NOT EXISTS idx_business_memory_tenant ON business_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- 3. Aktivasi RLS
ALTER TABLE business_memory ENABLE ROW LEVEL SECURITY;

-- Policy Dasar
CREATE POLICY "Users can view own business memory" ON business_memory FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
