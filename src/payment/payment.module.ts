import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';

import { PaydisiniModule } from './providers/paydisini/paydisini.module';

@Module({
  providers: [PaymentService],
  imports: [PaydisiniModule],
  exports: [PaymentService],
})
export class PaymentModule {}
