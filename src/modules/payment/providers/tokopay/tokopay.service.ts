import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { CustomError } from 'src/common/custom.error';

@Injectable()
export class TokopayService {
  private readonly apiKey: string = process.env.TOKOPAY_APIKEY;
  private readonly mercantId: string = process.env.TOKOPAY_MERCHANTID;

  async createPayment({
    kode_channel,
    reff_id,
    amount,
    customer_name,
    customer_email,
    customer_phone,
    expired_ts,
    items,
    redirect_url,
  }: {
    kode_channel: string;
    reff_id: string;
    amount: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    expired_ts: number;
    items: any;
    redirect_url?: string;
  }): Promise<TokopayRequestPaymentResponse> {
    const signature = this.generateSignature(reff_id);
    const payload: TokopayRequestPaymentPayload = {
      merchant_id: this.mercantId,
      redirect_url,
      kode_channel,
      reff_id,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      expired_ts,
      signature,
      items,
    };
    console.log('Payload to Tokopay Service', payload);

    const res = await fetch('https://api.tokopay.id/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    try {
      const resJson = await res.json();
      if (resJson.error_code) {
        throw new CustomError(
          400,
          resJson.error_msg || 'Failed to create payment',
        );
      }
      return resJson;
    } catch (e) {
      console.log('Error From Tokopay Service', e);
      throw new CustomError(500, 'Failed to create payment');
    }
  }

  private generateSignature(reff_id: string): string {
    return createHash('md5')
      .update(`${this.mercantId}:${this.apiKey}:${reff_id}`)
      .digest('hex');
  }
}

export interface TokopayRequestPaymentPayload {
  merchant_id: string;
  kode_channel: string;
  reff_id: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  redirect_url?: string;
  expired_ts: number;
  signature: string;
  items: any;
}

export interface TokopayRequestPaymentResponse {
  status: string;
  data?: {
    checkout_url?: string;
    nomor_va?: string;
    qr_link?: string;
    qr_string?: string;
    panduan_pembayaran: string;
    pay_url: string;
    total_bayar: number;
    total_diterima: number;
    trx_id: string;
  };
}
