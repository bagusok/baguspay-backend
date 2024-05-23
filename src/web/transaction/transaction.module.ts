import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

import { PaymentModule } from 'src/modules/payment/payment.module';

import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController],
  imports: [AuthModule, PaymentModule, PrismaModule, QueueModule],
})
export class TransactionModule {}
