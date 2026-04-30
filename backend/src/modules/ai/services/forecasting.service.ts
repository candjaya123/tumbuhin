import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../../../core/ai/gemini.provider';
import { AggregatorService } from './aggregator.service';
import { MemoryService } from './memory.service';

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly aggregatorService: AggregatorService,
    private readonly memoryService: MemoryService,
  ) {}

  async generateFinancialInsight(tenantId: string) {
    try {
      // 1. Ambil Data Semantik (Laba Rugi & Neraca)
      const financialData = await this.aggregatorService.getSemanticFinancialSummary(tenantId);

      // 2. Ambil Memori Bisnis (Konteks RAG)
      const memories = await this.memoryService.getRelevantMemories(tenantId);

      // 3. Bangun CFO Prompt
      const prompt = `
        Konteks: Kamu adalah CFO Virtual (Tumbuhin AI) untuk sebuah bisnis UMKM.
        Tujuan: Berikan analisa keuangan tajam, cari anomali, dan berikan prediksi.
        
        DATA KEUANGAN SAAT INI:
        ${JSON.stringify(financialData, null, 2)}
        
        MEMORI/POLA HISTORIS:
        ${JSON.stringify(memories.map(m => m.memory_data), null, 2)}
        
        TUGAS ANDA:
        1. Bandingkan data hari ini dengan memori historis.
        2. Identifikasi anomali (misal: pengeluaran tiba-tiba naik tajam).
        3. Berikan 1 saran strategis untuk meningkatkan laba bersih besok.
        
        Gunakan nada bicara yang profesional, tegas, namun memotivasi. Max 3 paragraf.
      `;

      const insight = await this.geminiProvider.generateContent(prompt);
      
      // 4. Simpan hasil analisa ke Memory untuk referensi masa depan
      await this.memoryService.saveBusinessInsight(
        tenantId, 
        'ai_reasoning', 
        `insight_${new Date().toISOString().split('T')[0]}`,
        { insight },
        0.9
      );

      return insight;
    } catch (error) {
      this.logger.error(`AI Reasoning failed: ${error.message}`);
      return "CFO Virtual kami sedang meninjau buku besar Anda. Mohon tunggu sebentar.";
    }
  }
}
