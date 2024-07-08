import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { RefundStatus } from '@prisma/client';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('transaction-process')
    private readonly transactionProcessQueue: Queue,
  ) {}

  async addTransactionProcessJob(data: {
    trxId: string;
    userId?: string;
    status: string;
  }) {
    await this.transactionProcessQueue.add('transaction', data);
    // console.log(a);
    return {
      message: 'Success add transaction job, trxId: ' + data.trxId,
    };
  }

  async addDepositProcessJob(data: {
    depositId: string;
    userId?: string;
    status: string;
    amount: number;
  }) {
    await this.transactionProcessQueue.add('deposit', data);
    // console.log(a);
    return {
      message: 'Success add deposit job, depositId: ' + data.depositId,
    };
  }

  async processRefund(data: {
    trxId: string;
    userId: string;
    isRefunded: boolean;
    refundStatus: RefundStatus;
  }) {
    await this.transactionProcessQueue.add('refund', data);
    return {
      message: 'Success add refund job, trxId: ' + data.trxId,
    };
  }
}
