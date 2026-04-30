import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  // Static templates to replace expensive & slow AI calls during high-volume registration
  private readonly TEMPLATES = {
    standard: [
      // ASSET
      { code: '1-10000', name: 'Kas Tangan', type: 'asset', balance: 'debit' },
      { code: '1-10002', name: 'Kas Bank', type: 'asset', balance: 'debit' },
      { code: '1-10003', name: 'E-Wallet', type: 'asset', balance: 'debit' },
      { code: '1-10100', name: 'Biaya Dibayar di Muka', type: 'asset', balance: 'debit' },
      { code: '1-10300', name: 'Piutang Usaha', type: 'asset', balance: 'debit' },
      { code: '1-10400', name: 'Perlengkapan', type: 'asset', balance: 'debit' },
      { code: '1-10500', name: 'Persediaan Bahan Baku', type: 'asset', balance: 'debit' },
      { code: '1-10503', name: 'Persediaan Barang Dagang', type: 'asset', balance: 'debit' },
      { code: '1-15000', name: 'Peralatan', type: 'asset', balance: 'debit' },
      { code: '1-15900', name: 'Akumulasi Penyusutan', type: 'asset', balance: 'credit' },
      // LIABILITAS
      { code: '2-20100', name: 'Hutang Usaha', type: 'liability', balance: 'credit' },
      { code: '2-20400', name: 'Hutang Bank', type: 'liability', balance: 'credit' },
      // EKUITAS
      { code: '3-30000', name: 'Modal', type: 'equity', balance: 'credit' },
      { code: '3-31000', name: 'Prive', type: 'equity', balance: 'debit' },
      // REVENUE
      { code: '4-40000', name: 'Penjualan Produk', type: 'revenue', balance: 'credit' },
      { code: '4-41000', name: 'Diskon Penjualan', type: 'revenue', balance: 'debit' },
      { code: '4-41001', name: 'Retur Penjualan', type: 'revenue', balance: 'debit' },
      // COGS
      { code: '5-50000', name: 'Harga Pokok Penjualan', type: 'expense', balance: 'debit' },
      // EXPENSE
      { code: '6-60000', name: 'Biaya Admin', type: 'expense', balance: 'debit' },
      { code: '6-60200', name: 'Biaya Utility', type: 'expense', balance: 'debit' },
      { code: '6-60300', name: 'Biaya Marketing', type: 'expense', balance: 'debit' },
      { code: '6-60100', name: 'Beban Gaji', type: 'expense', balance: 'debit' },
      { code: '6-60400', name: 'Beban Sewa', type: 'expense', balance: 'debit' },
      { code: '6-60999', name: 'Biaya Lain-lain', type: 'expense', balance: 'debit' },
    ]
  };

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async setupSystem(tenantId: string, input: { industry: string; scale: string; complexity: string }) {
    this.logger.log(`Starting deterministic onboarding setup for tenant: ${tenantId}`);

    const selectedTemplate = this.TEMPLATES.standard;

    const accountsToInsert = selectedTemplate.map(acc => ({
      tenant_id: tenantId,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      normal_balance: acc.balance,
    }));

    const client = this.supabaseService.getClient();

    // 1. Insert COA
    const { error: coaError } = await client.from('chart_of_accounts').insert(accountsToInsert);
    if (coaError) {
      this.logger.error(`Failed to insert COA: ${coaError.message}`);
      throw new Error(`Gagal menyimpan Chart of Accounts: ${coaError.message}`);
    }

    // 2. Update Profile metadata
    const { error: profileError } = await client
      .from('profiles')
      .update({
        industry: input.industry,
        business_scale: input.scale,
        financial_complexity: input.complexity,
        enabled_modules: ['pos', 'inventory', 'accounting'], // Standard modules
        accounting_assumptions: {
          method: 'accrual',
          currency: 'IDR',
          is_ai_setup: false
        },
      })
      .eq('tenant_id', tenantId);

    if (profileError) {
      this.logger.error(`Failed to update profile: ${profileError.message}`);
      throw new Error(`Gagal memperbarui profil bisnis: ${profileError.message}`);
    }

    this.logger.log(`Onboarding setup (Deterministic) completed successfully for tenant: ${tenantId}`);
    return { success: true, template_used: 'standard' };
  }
}
