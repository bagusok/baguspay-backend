import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  providers: [PaymentMethodService],
  controllers: [PaymentMethodController],
  imports: [PrismaModule],
})
export class PaymentMethodModule {}
