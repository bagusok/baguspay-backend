import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { QueueConsumer } from './queue.consumer';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { DigiflazzModule } from 'src/modules/h2hprovider/digiflazz/digiflazz.module';
import { BalanceModule } from 'src/modules/payment/providers/balance/balance.module';

@Module({
  providers: [QueueService, QueueConsumer],
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'transaction-process',
    }),
    // Konfigurasi BullBoard
    BullBoardModule.forRoot({
      route: '/queue-monitor',
      adapter: ExpressAdapter,
    }),
    // Registrasikan queue ke BullBoard
    BullBoardModule.forFeature({
      name: 'transaction-process',
      adapter: BullAdapter,
    }),

    PrismaModule,
    DigiflazzModule,
    BalanceModule,
  ],
  exports: [QueueService],
})
export class QueueModule {}
