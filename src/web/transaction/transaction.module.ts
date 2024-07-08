import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

import { PaymentModule } from 'src/modules/payment/payment.module';

import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { QueueModule } from 'src/queue/queue.module';
import { DigiflazzModule } from 'src/modules/h2hprovider/digiflazz/digiflazz.module';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController],
  imports: [
    AuthModule,
    PaymentModule,
    PrismaModule,
    QueueModule,
    DigiflazzModule,
  ],
})
export class TransactionModule {}
