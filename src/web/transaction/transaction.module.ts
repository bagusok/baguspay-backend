import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController],
  imports: [PrismaModule, PaymentModule],
})
export class TransactionModule {}
