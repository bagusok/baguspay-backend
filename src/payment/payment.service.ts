import {
  ICreateTransactionResponse,
  PaydisniQRISResponse,
  PaydisniRetailResponse,
  PaydisniVirtualAccountResponse,
} from './providers/paydisini/paydisini.types';
import { Injectable } from '@nestjs/common';
import { PaydisiniService } from './providers/paydisini/paydisini.service';
import {
  ICancelTransactionParams,
  ICreateTransactionParams,
} from '@ibnusyawall/paydisini/lib/interfaces/paydisini.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly paydisiniService: PaydisiniService) {}

  async createPayment(
    _data: ICreatePaymentParams,
  ): Promise<IReturnCreatePayment> {
    switch (_data.paymentMethodProvider) {
      case EPaymentMethodProvider.PAYDISINI:
        const data: ICreateTransactionParams = {
          amount: _data.amount,
          note: _data.description,
          service: parseInt(_data.idPaymentMethodProvider),
          unique_code: _data.trxId,
          type_fee: 2,
          ewallet_phone: _data.phone ?? '0',
          valid_time: _data.validTime ?? 60 * 60 * 3,
        };

        const create: ICreateTransactionResponse =
          await this.paydisiniService.createTransaction(data);

        if (create.success == false) {
          return null;
        }

        console.log(create.data);

        return {
          ref: create.data.unique_code,
          amount: Number(create.data.amount),
          balance: Number(create.data.balance),
          fee: Number(create.data.fee),
          status: create.data.status,
          expired: create.data.expired,
          pay_code:
            ((create.data as PaydisniVirtualAccountResponse).virtual_account ||
              (create.data as PaydisniRetailResponse).payment_code) ??
            null,
          isQrcode: (create.data as PaydisniQRISResponse).qr_content
            ? true
            : false,
          linkPayment: create?.data?.checkout_url ?? null,
          qrData: (create.data as PaydisniQRISResponse).qr_content ?? null,
        };

        break;
      case EPaymentMethodProvider.DUITKU:
        // return this.paydisiniService.createTransaction(data);
        break;
    }
  }

  async cancelPayment(_data: ICancelPaymentParams) {
    switch (_data.paymentMethodProvider) {
      case EPaymentMethodProvider.PAYDISINI:
        const data: ICancelTransactionParams = {
          unique_code: _data.trxId,
        };

        const cancel = await this.paydisiniService.cancelTransaction(data);

        if (cancel.success == false) {
          return null;
        }

        return {
          ref: cancel.data.unique_code,
          amount: cancel.data.amount,
          balance: cancel.data.balance,
          fee: cancel.data.fee,
          status: cancel.data.status,
          expired: cancel.data.expired,
        };

        break;
    }
  }

  async handleCallbackPayment(
    data: ICallbackPaymentParams,
  ): Promise<IReturnCallbackPayment | null> {
    switch (data.paymentMethodProvider) {
      case EPaymentMethodProvider.PAYDISINI:
        const verify = this.paydisiniService.callbackVerify(data);

        if (verify.success == false) {
          return null;
        }

        return {
          ref: data.trxId,
          status: data.trxStatus,
          success: true,
        };

        break;
    }
  }
}

interface ICreatePaymentParams {
  trxId: string;
  amount: number;
  fees?: number;
  description?: string;
  validTime?: number;
  phone?: string;
  email?: string;
  idPaymentMethodProvider: string;
  paymentMethodProvider: 'PAYDISINI' | 'DUITKU';
}

interface ICancelPaymentParams {
  trxId: string;
  paymentMethodProvider?: 'PAYDISINI' | 'DUITKU';
}

export interface ICallbackPaymentParams {
  trxId?: string;
  trxRef?: string;
  trxAmount?: number;
  trxStatus?: string;
  trxDatetime?: string;
  paymentMethodProvider?: 'PAYDISINI' | 'DUITKU';
  sign?: string;
}

enum EPaymentMethodProvider {
  PAYDISINI = 'PAYDISINI',
  DUITKU = 'DUITKU',
}

interface IReturnCreatePayment {
  ref: string;
  amount: number;
  balance: number;
  fee: number;
  status: string;
  expired: string;
  pay_code?: string;
  isQrcode: boolean;
  linkPayment?: string;
  qrData?: string;
}

interface IReturnCallbackPayment {
  success: boolean;
  ref: string;
  amount?: number;
  balance?: number;
  fee?: number;
  status?: string;
  date?: string;
}
