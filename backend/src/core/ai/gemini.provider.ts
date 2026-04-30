import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './ai.provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Note: In production, this should throw an error. 
      // For initialization we can just log a warning if not provided yet.
      console.warn('GEMINI_API_KEY is missing in environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<any> {
    if (!this.genAI) throw new Error('Gemini API is not configured');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Ekstrak informasi dari gambar struk/nota ini.
    Kembalikan dalam format JSON murni:
    {
      "vendor_name": { "value": string, "confidence": "high"|"medium"|"low" },
      "total_amount": { "value": number, "confidence": "high"|"medium"|"low" },
      "date": { "value": string, "confidence": "high"|"medium"|"low" },
      "suggested_coa": { "value": string, "confidence": "high"|"medium"|"low" }
    }
    Berikan keyakinan "low" jika tulisan buram atau meragukan. Kembalikan HANYA JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON: ' + text);
    }
  }

  async generateContent(prompt: string, modelName = 'gemini-1.5-flash'): Promise<string> {
    if (!this.genAI) throw new Error('Gemini API is not configured');
    const model = this.genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
