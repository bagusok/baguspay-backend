import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';

import { PaydisiniModule } from './providers/paydisini/paydisini.module';
import { AuthModule } from 'src/auth/auth.module';
import { BalanceModule } from './providers/balance/balance.module';
import { TokopayModule } from './providers/tokopay/tokopay.module';

@Module({
  providers: [PaymentService],
  imports: [PaydisiniModule, AuthModule, BalanceModule, TokopayModule],
  exports: [PaymentService],
})
export class PaymentModule {}
