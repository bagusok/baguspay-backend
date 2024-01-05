import {
  ICreateTransactionResponse,
  PaydisniQRISResponse,
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

  async createPayment(_data: ICreatePaymentParams) {
    switch (_data.paymentMethodProvider) {
      case EPaymentMethodProvider.PAYDISINI:
        const data: ICreateTransactionParams = {
          amount: _data.amount,
          note: _data.description,
          service: parseInt(_data.idPaymentMethodProvider),
          unique_code: _data.trxId,
          type_fee: 1,
          ewallet_phone: _data.phone ?? '0',
          valid_time: _data.validTime ?? 60 * 60 * 3,
        };

        const create: ICreateTransactionResponse =
          await this.paydisiniService.createTransaction(data);

        if (create.success == false) {
          return null;
        }

        return {
          ref: create.data.unique_code,
          amount: create.data.amount,
          balance: create.data.balance,
          fee: create.data.fee,
          status: create.data.status,
          expired: create.data.expired,
          isQrcode: (create.data as PaydisniQRISResponse).qr_content
            ? true
            : false,
          linkPayment: create?.data?.checkout_url ?? null,
          qrData: (create.data as PaydisniQRISResponse).qr_content,
        };

        break;
      case EPaymentMethodProvider.DUITKU:
        // return this.paydisiniService.createTransaction(data);
        break;
      default:
        return {
          status: 503,
          message: 'Payment method not available',
        };
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

enum EPaymentMethodProvider {
  PAYDISINI = 'PAYDISINI',
  DUITKU = 'DUITKU',
}
