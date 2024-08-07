import { Injectable, Logger } from '@nestjs/common';
import {
  ICallbackPaymentParams,
  PaymentService,
} from 'src/modules/payment/payment.service';
import { ICallbackPaydisiniParams } from 'src/modules/payment/providers/paydisini/paydisini.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import * as crypto from 'crypto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class CallbackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly queueService: QueueService,
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

    console.log('get: ', data);

    try {
      if (data.trxId.startsWith('depo')) {
        const updateDeposit = await this.prismaService.deposit.update({
          data: {
            depositStatus: 'PROCESS',
          },
          where: {
            id: data.trxId,
            depositStatus: 'PENDING',
          },
        });

        if (!updateDeposit) {
          return {
            success: 'false',
            message: 'Deposit not found or Already Processed',
          };
        }

        await this.queueService.addDepositProcessJob({
          amount: updateDeposit.amount,
          depositId: data.trxId,
          userId: updateDeposit.userId,
          status: updateDeposit.depositStatus,
        });

        return {
          statusCode: 200,
          depositId: data.trxId,
          // status: updateTrx.paidStatus,
          success: 'true',
        };
      } else {
        const paidStatus = _data.status == 'Success' ? 'PAID' : 'CANCELED';

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
            message: 'Transaction not found or Already Paid or Expired',
          };
        }

        // Add QUEUE Transaction Process
        await this.queueService.addTransactionProcessJob({
          trxId: data.trxId,
          status: updateTrx.paidStatus,
        });

        return {
          statusCode: 200,
          trxId: data.trxId,
          status: updateTrx.paidStatus,
          success: 'true',
        };
      }
    } catch (error) {
      if (error?.code == 'P2025') {
        console.log('prisma update err: ', error?.meta?.cause);
      }

      console.log('error: ', error);

      return {
        success: 'false',
        message: 'Transaction not found or Already Paid or Expired',
      };
    }
  }

  async digiflazzCallback(req: any, data: any) {
    const signature = crypto
      .createHmac('sha1', process.env.DIGIFLAZZ_CALLBACK_SECRET)
      .update(JSON.stringify(data))
      .digest('hex');

    console.log('Signature', data);

    if (req.headers['x-hub-signature'].replace('sha1=', '') != signature) {
      Logger.error('Invalid Signature');
      return {
        success: 'false',
        message: 'Invalid Signature',
      };
    }

    let status = 'FAILED';
    if (data.data.status == 'Sukses') {
      status = 'SUCCESS';
    } else {
      status = 'FAILED';
    }

    const updateTransactionDto = await this.prismaService.transactions.update({
      data: {
        orderStatus: status as OrderStatus,
        snRef: data.data.sn,
      },
      where: {
        id: data.data.ref_id,
      },
    });

    if (!updateTransactionDto) {
      return {
        success: 'false',
        message: 'Transaction not found',
      };
    }

    return {
      success: 'true',
    };

    return {
      success: 'false',
      message: 'No Operation Found',
    };
  }
}
