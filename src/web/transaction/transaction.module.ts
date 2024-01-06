import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

import { PaymentModule } from 'src/payment/payment.module';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController],
  imports: [AuthModule, PaymentModule, PrismaModule],
})
export class TransactionModule {}
