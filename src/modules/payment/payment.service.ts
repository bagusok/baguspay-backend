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
import {
  BalanceRefType,
  PaidStatus,
  PaymentMethodProvider,
  PaymentMethodType,
} from '@prisma/client';
import { BalanceService } from './providers/balance/balance.service';
import { TokopayService } from './providers/tokopay/tokopay.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paydisiniService: PaydisiniService,
    private readonly balanceService: BalanceService,
    private readonly tokopayService: TokopayService,
  ) {}

  async createPayment(
    _data: ICreatePaymentParams,
  ): Promise<IReturnCreatePayment> {
    const expiryTime = new Date().getTime() + _data.validTime * 1000;

    switch (_data.paymentMethodProvider) {
      case PaymentMethodProvider.PAYDISINI:
        const data: ICreateTransactionParams = {
          amount: _data.amountTotal,
          note: _data.description,
          service: parseInt(_data.idPaymentMethodProvider),
          unique_code: _data.trxId,
          type_fee: 2,
          ewallet_phone: _data.phone ?? '0',
          valid_time: _data.validTime,
        };

        const create: ICreateTransactionResponse =
          await this.paydisiniService.createTransaction(data);
        console.log('create', create);

        if (create.success == false) {
          return null;
        }

        return {
          ref: create.data.unique_code,
          amount: Number(create.data.amount),
          balance: Number(create.data.balance),
          fee: Number(create.data.fee),
          status: create.data.status.toUpperCase() as PaidStatus,
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
      case PaymentMethodProvider.DUITKU:
        // return this.paydisiniService.createTransaction(data);
        break;
      case PaymentMethodProvider.SALDO:
        await this.balanceService.deductBalance(
          _data.userId,
          _data.amountTotal,
          _data.description,
          _data.trxId,
          BalanceRefType.TRANSACTION,
        );

        return {
          ref: _data.trxId,
          amount: Number(_data.amount),
          balance: Number(_data.amount),
          fee: Number(_data.fees ?? 0),
          status: PaidStatus.PAID,
          expired: new Date(expiryTime).toISOString().slice(0, -5),
          pay_code: null,
          isQrcode: false,
          linkPayment: null,
          qrData: null,
        };
        break;
      case PaymentMethodProvider.TOKOPAY:
        const tokopay = await this.tokopayService.createPayment({
          amount: _data.amountTotal,
          customer_email: 'okebagus426@gmail.com',
          customer_name: 'Customer',
          customer_phone: '082301278360',
          expired_ts: new Date(expiryTime).getTime(),
          kode_channel: _data.idPaymentMethodProvider,
          reff_id: _data.trxId,
          redirect_url: 'https://google.com',
          items: [
            {
              product_code: _data.trxId,
              name: _data.description,
              price: _data.amount,
              product_url: 'https://product.com',
              image_url: 'https://image.com',
            },
          ],
        });

        if (tokopay.status == 'Success') {
          console.log('tokopay', tokopay, new Date(expiryTime).toISOString());
          return {
            amount: tokopay.data.total_bayar,
            balance: tokopay.data.total_diterima,
            expired: new Date(expiryTime).toISOString().slice(0, -5),
            fee: tokopay.data.total_bayar - tokopay.data.total_diterima,
            isQrcode: tokopay.data.qr_string ? true : false,
            linkPayment: tokopay.data?.checkout_url || tokopay.data.pay_url,
            ref: tokopay.data.trx_id,
            pay_code: tokopay.data.nomor_va,
            status: PaidStatus.PENDING,
            qrData: tokopay.data.qr_string,
          };
        } else {
          return null;
        }
        break;
    }
  }

  async cancelPayment(_data: ICancelPaymentParams) {
    switch (_data.paymentMethodProvider) {
      case PaymentMethodProvider.PAYDISINI:
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
      case PaymentMethodProvider.PAYDISINI:
        const verify = this.paydisiniService.callbackVerify(data);
        console.log('verify', verify);

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

  private calculatePulsaRate(persen, nilai) {
    console.log('persen', persen, nilai);
    return Math.round((nilai * 100) / persen);
  }
}

interface ICreatePaymentParams {
  userId?: string;
  trxId: string;
  amount: number;
  amountTotal: number;
  type: PaymentMethodType;
  fees?: number;
  feesInPercent?: string;
  description?: string;
  validTime?: number;
  phone?: string;
  email?: string;
  idPaymentMethodProvider: string;
  paymentMethodProvider: PaymentMethodProvider;
}

interface ICancelPaymentParams {
  trxId: string;
  paymentMethodProvider?: PaymentMethodProvider;
}

export interface ICallbackPaymentParams {
  trxId?: string;
  trxRef?: string;
  trxAmount?: number;
  trxStatus?: string;
  trxDatetime?: string;
  paymentMethodProvider?: PaymentMethodProvider;
  sign?: string;
}

interface IReturnCreatePayment {
  ref: string;
  amount: number;
  balance: number;
  fee: number;
  status: PaidStatus;
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
