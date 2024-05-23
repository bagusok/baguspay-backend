import { Module } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { CallbackController } from './callback.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  providers: [CallbackService],
  controllers: [CallbackController],
  imports: [PrismaModule, PaymentModule, QueueModule],
})
export class CallbackModule {}
