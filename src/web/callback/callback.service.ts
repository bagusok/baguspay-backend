import { Injectable } from '@nestjs/common';
import {
  ICallbackPaymentParams,
  PaymentService,
} from 'src/payment/payment.service';
import { ICallbackPaydisiniParams } from 'src/payment/providers/paydisini/paydisini.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CallbackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async paydisiniCallback(_data: ICallbackPaydisiniParams) {
    const data: ICallbackPaymentParams = {
      trxId: _data.unique_code,
      paymentMethodProvider: 'PAYDISINI',
      trxStatus: _data.status,
      sign: _data.signature,
    };

    const get = await this.paymentService.handleCallbackPayment(data);

    if (!get) {
      return {
        success: 'false',
      };
    }
    try {
      const paidStatus = _data.status == 'Success' ? 'PAID' : 'CANCELLED';

      const updateTrx = await this.prismaService.transactions.update({
        data: {
          paidStatus: paidStatus,
          paidAt: new Date(),
        },
        where: {
          id: data.trxId,
          paidStatus: 'PENDING',
          expiredAt: {
            gte: new Date(),
          },
        },
      });

      if (!updateTrx) {
        return {
          success: 'false',
        };
      }

      return {
        statusCode: 200,
        trxId: data.trxId,
        status: updateTrx.paidStatus,
        success: 'true',
      };
    } catch (error) {
      if (error?.code == 'P2025') {
        console.log('prisma update err: ', error?.meta?.cause);
      }
      return {
        success: 'false',
      };
    }
  }
}
