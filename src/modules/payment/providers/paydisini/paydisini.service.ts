import { Paydisini } from '@ibnusyawall/paydisini';
import {
  ICancelTransactionParams,
  ICheckTransactionParams,
  ICreateTransactionParams,
} from '@ibnusyawall/paydisini/lib/interfaces/paydisini.interface';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ICreateTransactionResponse } from './paydisini.types';
import { ICallbackPaymentParams } from 'src/modules/payment/payment.service';

@Injectable()
export class PaydisiniService {
  paydisini: Paydisini;
  apiKey: string;

  constructor() {
    this.paydisini = new Paydisini(process.env.PAYDISINI_APIKEY);
    // this.apiKey = process.env.PAYDISINI_APIKEY;
  }

  async createTransaction(
    opt: ICreateTransactionParams,
  ): Promise<ICreateTransactionResponse> {
    return this.paydisini.createTransaction(opt);
  }

  // async createTransaction(opt: ICreateTransactionParams) {
  //   const form = new FormData();
  //   form.append('key', this.apiKey);
  //   form.append('request', 'new');
  //   form.append('unique_code', opt.unique_code);
  //   form.append('service', opt.service.toString());
  //   form.append('amount', opt.amount.toString());
  //   form.append('note', opt.note);
  //   form.append('valid_time', opt.valid_time.toString());
  //   form.append('type_fee', opt.type_fee.toString() || '1');
  //   form.append(
  //     'signature',
  //     this.generateMD5(
  //       this.apiKey,
  //       opt.unique_code,
  //       opt.service.toString(),
  //       opt.amount.toString(),
  //       opt.valid_time.toString(),
  //     ),
  //   );

  //   const a = await fetch('https://paydisini.co.id/api/', {
  //     method: 'POST',
  //     body: form,
  //   });

  //   const b = await a.json();
  //   return b;
  // }

  async cancelTransaction(opt: ICancelTransactionParams) {
    return this.paydisini.cancelTransaction(opt);
  }

  async getTransactionStatus(opt: ICheckTransactionParams) {
    return this.paydisini.checkTransaction(opt);
  }

  callbackVerify(opt: ICallbackPaymentParams): {
    success: boolean;
  } {
    const concatString = this.paydisini.key + opt.trxId + 'CallbackStatus';
    const md5Hash = crypto.createHash('md5').update(concatString).digest('hex');

    if (md5Hash == opt.sign) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
      };
    }
  }
}

export interface ICallbackPaydisiniParams {
  key: string;
  pay_id: string;
  unique_code: string;
  status: 'Success' | 'Canceled';
  signature: string;
}
