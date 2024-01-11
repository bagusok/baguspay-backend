import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './web/users/users.module';
import { ProductsModule } from './web/products/products.module';
import { ServicesModule } from './web/services/services.module';
import { FilePickerModule } from './web/file-picker/file-picker.module';
import { PaymentMethodModule } from './web/payment-method/payment-method.module';
import { TransactionModule } from './web/transaction/transaction.module';
import { PaydisiniModule } from './payment/providers/paydisini/paydisini.module';
import { PaymentModule } from './payment/payment.module';
import { CallbackModule } from './web/callback/callback.module';
import { ServiceGroupModule } from './web/services/service-group/service-group.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ServicesModule,
    FilePickerModule,
    PaymentMethodModule,
    TransactionModule,
    PaydisiniModule,
    PaymentModule,
    CallbackModule,
    ServiceGroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
