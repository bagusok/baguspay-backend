import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class DigiflazzService {
  private readonly apiUrl = 'https://api.digiflazz.com/v1';
  private readonly username = process.env.DEV_DIGIFLAZZ_USERNAME;

  public async getAllProduct(cmd: 'prepaid' | 'postpaid' = 'prepaid') {
    try {
      const getAll = await fetch(`${this.apiUrl}/price-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: cmd,
          username: this.username,
          sign: this.createSign('depo'),
        }),
      });
      const getAllJson = await getAll.json();
      return getAllJson;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  public async createTransaction(data: {
    commands: null | 'pay-pasca' | 'inq-pasca';
    buyer_sku_code: string;
    customer_no: string;
    ref_id: string;
    allow_dot?: boolean;
  }) {
    const testing = process.env.MODE == 'dev' ? true : false;

    try {
      const create = await fetch(`${this.apiUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          sign: this.createSign(data.ref_id),
          testing: testing,
          ...data,
        }),
      });
      const createJson = await create.json();
      return createJson;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  public async checkTagihan(data: {
    buyer_sku_code: string;
    customer_no: string;
    ref_id: string;
  }) {
    const testing = process.env.MODE == 'dev' ? true : false;

    try {
      const create = await fetch(`${this.apiUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commands: 'inq-pasca',
          username: this.username,
          sign: this.createSign(data.ref_id),
          testing: testing,
          ...data,
        }),
      });
      const createJson = await create.json();
      console.log('data check tagihan', createJson);
      return createJson;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private createSign(cmd: string): string {
    return createHash('md5')
      .update(
        `${process.env.DEV_DIGIFLAZZ_USERNAME}${process.env.DEV_DIGIFLAZZ_APIKEY}${cmd}`,
      )
      .digest('hex');
  }
}
