import { Paydisini } from '@ibnusyawall/paydisini';
import {
  ICallbackStatusParams,
  ICancelTransactionParams,
  ICheckTransactionParams,
  ICreateTransactionParams,
} from '@ibnusyawall/paydisini/lib/interfaces/paydisini.interface';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PaydisiniService {
  paydisini: Paydisini;
  apiKey: string;

  constructor() {
    this.paydisini = new Paydisini(process.env.PAYDISINI_APIKEY);
    // this.apiKey = process.env.PAYDISINI_APIKEY;
  }

  async createTransaction(opt: ICreateTransactionParams) {
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

  async callbackStatus(opt: ICallbackStatusParams) {
    return this.paydisini.callbackStatus(opt);
  }
  private generateMD5(key, unique_code, service, amount, valid_time) {
    const concatenatedString =
      key + unique_code + service + amount + valid_time + 'NewTransaction';
    const md5Hash = crypto
      .createHash('md5')
      .update(concatenatedString)
      .digest('hex');
    return md5Hash;
  }
}
