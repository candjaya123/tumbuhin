import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly baseUrl = this.isProduction
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1';

  private get authHeader() {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const base64Key = Buffer.from(`${serverKey}:`).toString('base64');
    return `Basic ${base64Key}`;
  }

  async createSnapToken(params: {
    transaction_details: { order_id: string; gross_amount: number };
    customer_details?: { first_name: string; email: string; phone: string };
    item_details?: any[];
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/transactions`, params, {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Midtrans Snap Error: ${error.response?.data?.error_messages || error.message}`);
      throw new Error('Gagal membuat token pembayaran Midtrans');
    }
  }

  async executePayout(params: {
    beneficiary_name: string;
    beneficiary_account: string;
    beneficiary_bank: string;
    amount: string;
    notes: string;
  }) {
    // IRIS API implementation (simplified)
    const irisUrl = this.isProduction
      ? 'https://app.midtrans.com/iris/api/v1'
      : 'https://app.sandbox.midtrans.com/iris/api/v1';

    try {
      const response = await axios.post(`${irisUrl}/payouts`, {
        payouts: [
          {
            beneficiary_name: params.beneficiary_name,
            beneficiary_account: params.beneficiary_account,
            beneficiary_bank: params.beneficiary_bank,
            beneficiary_email: 'admin@tumbuhin.com',
            amount: params.amount,
            notes: params.notes,
          }
        ]
      }, {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `payout-${Date.now()}`,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Midtrans IRIS Error: ${error.response?.data || error.message}`);
      throw new Error('Gagal mengeksekusi pencairan dana');
    }
  }
}
