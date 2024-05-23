import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { BalanceModule } from 'src/modules/payment/providers/balance/balance.module';
import { PaymentModule } from 'src/modules/payment/payment.module';

@Module({
  controllers: [DepositController],
  providers: [DepositService],
  imports: [PrismaModule, BalanceModule, PaymentModule],
})
export class DepositModule {}
