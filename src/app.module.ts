import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './web/users/users.module';
import { ProductsModule } from './web/products/products.module';
import { ServicesModule } from './web/services/services.module';
import { FilePickerModule } from './web/file-picker/file-picker.module';
import { PaymentMethodModule } from './web/payment-method/payment-method.module';
import { TransactionModule } from './web/transaction/transaction.module';
import { PaydisiniModule } from './modules/payment/providers/paydisini/paydisini.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CallbackModule } from './web/callback/callback.module';
import { ServiceGroupModule } from './web/services/service-group/service-group.module';
import { AutoModule } from './auto/auto.module';
import { QueueModule } from './queue/queue.module';
import { TestModule } from './web/test/test.module';
import { DepositModule } from './web/deposit/deposit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SignatureMiddleware } from './middlewares/signature.middleware';

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
    AutoModule,
    QueueModule,
    TestModule,
    DepositModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(SignatureMiddleware)
    //   .exclude(
    //     {
    //       path: '/callback/*',
    //       method: RequestMethod.ALL,
    //     },
    //     {
    //       path: '/swagger',
    //       method: RequestMethod.GET,
    //     },
    //     {
    //       path: '/queue-monitor',
    //       method: RequestMethod.GET,
    //     },
    //     {
    //       path: '/',
    //       method: RequestMethod.ALL,
    //     },
    //     {
    //       path: '/v1/admin/*',
    //       method: RequestMethod.ALL,
    //     },
    //   )
    //   .forRoutes('/v1');
  }
}
