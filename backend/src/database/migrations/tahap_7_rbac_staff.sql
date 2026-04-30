-- 1. Tabel Akun Staf (Bawah Tenant)
CREATE TABLE IF NOT EXISTS staff_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'cashier', -- manager, cashier, warehouse_staff
    pin VARCHAR(4) NOT NULL, -- PIN 4 digit untuk login cepat di POS
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, profile_id)
);

-- 2. Aktifkan RLS
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant's staff" 
ON staff_accounts FOR SELECT 
USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 3. Tambahkan kolom role ke profiles untuk integrasi JWT
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'owner';
