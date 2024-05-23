import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { BalanceRefType, OrderStatus } from '@prisma/client';
import { Job } from 'bull';
import { DigiflazzService } from 'src/modules/h2hprovider/digiflazz/digiflazz.service';
import { BalanceService } from 'src/modules/payment/providers/balance/balance.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Processor('transaction-process')
export class QueueConsumer {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly digiflazzService: DigiflazzService,
    private readonly balanceService: BalanceService,
  ) {}

  @Process('transaction')
  async process(job: Job<{ trxId: string; status: string }>) {
    Logger.log(`Processing job ${job.id}`);
    Logger.log(job.data);

    try {
      const findTrx = await this.prismaService.transactions.findUnique({
        where: {
          id: job.data.trxId,
          paidStatus: 'PAID',
        },
        include: {
          user: true,
        },
      });

      if (!findTrx) {
        throw new Error('Transaction not found');
      }

      const findProduct = await this.prismaService.products.findUnique({
        where: {
          id: findTrx.productId,
        },
      });

      if (!findProduct) {
        throw new Error('Product not found');
      }

      switch (findProduct.h2hProvider) {
        case 'DIGIFLAZZ':
          const createDigiflazz = await this.digiflazzService.createTransaction(
            {
              buyer_sku_code: findProduct.idProductProvider,
              customer_no: findTrx.inputData.replace(':', ''),
              ref_id: findTrx.id,
            },
          );

          console.log('INI CREATE DIGI', createDigiflazz);

          let trxStatus: OrderStatus = 'PENDING';

          if (createDigiflazz.data.status == 'Sukses') {
            trxStatus = 'SUCCESS';
          } else if (createDigiflazz.data.status == 'Pending') {
            trxStatus = 'PROCESS';
          } else {
            trxStatus = 'FAILED';
          }

          await this.prismaService.transactions.update({
            data: {
              orderStatus: trxStatus,
              ...(trxStatus == 'FAILED' && { isRefunded: true }),
              ...(findTrx.userId !== null &&
                trxStatus == 'FAILED' &&
                findTrx.userId !== null && { refundStatus: 'PROCESS' }),
              ...(trxStatus == 'SUCCESS'
                ? { notes: `SN: ${createDigiflazz?.data?.sn}` }
                : { notes: createDigiflazz?.data?.message }),
            },
            where: {
              id: findTrx.id,
            },
          });

          if (trxStatus == 'FAILED' && findTrx.userId !== null) {
            await this.balanceService.addBalance(
              findTrx.userId,
              findTrx.totalPrice,
              `REFUND - ${findProduct.name}`,
              findTrx.id,
              BalanceRefType.REFUND,
              'Refund',
            );

            await this.prismaService.transactions.update({
              data: {
                refundStatus: 'SUCCESS',
              },
              where: {
                id: findTrx.id,
              },
            });

            await this.prismaService.products.update({
              data: {
                stock: {
                  increment: findTrx.productQty,
                },
              },
              where: {
                id: findProduct.id,
              },
            });
          }

          break;
      }
    } catch (e) {
      Logger.error('Process Transaction Error: ', e);
    }
  }

  @Process('deposit')
  async processDeposit(
    job: Job<{
      depositId: string;
      status: string;
      amount: number;
      userId: string;
    }>,
  ) {
    try {
      const findDeposit = await this.prismaService.deposit.findUnique({
        where: {
          id: job.data.depositId,
          depositStatus: 'PROCESS',
        },
        include: {
          user: true,
        },
      });

      if (!findDeposit) {
        throw new Error('Transaction not found');
      }

      await this.prismaService.$transaction(async (tx) => {
        await this.balanceService.addBalance(
          findDeposit.userId,
          findDeposit.amount,
          'DEPOSIT',
          findDeposit.id,
          BalanceRefType.DEPOSIT,
          'Deposit',
        );

        await tx.deposit.update({
          data: {
            depositStatus: 'SUCCESS',
          },
          where: {
            id: findDeposit.id,
          },
        });
      });
    } catch (e) {
      Logger.error('Process Transaction Error: ', e);
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    Logger.log(`Completed job ${job.id} of type ${job.name}`);
    Logger.log(result);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    Logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
