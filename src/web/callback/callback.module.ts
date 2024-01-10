import { Module } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { CallbackController } from './callback.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  providers: [CallbackService],
  controllers: [CallbackController],
  imports: [PrismaModule, PaymentModule],
})
export class CallbackModule {}
