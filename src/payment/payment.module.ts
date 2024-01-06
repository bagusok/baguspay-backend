import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';

import { PaydisiniModule } from './providers/paydisini/paydisini.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [PaymentService],
  imports: [PaydisiniModule, AuthModule],
  exports: [PaymentService],
})
export class PaymentModule {}
