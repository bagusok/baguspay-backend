import { Module } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';

import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { BalanceModule } from 'src/modules/payment/providers/balance/balance.module';

@Module({
  providers: [UserBalanceService],
  imports: [PrismaModule, BalanceModule],
})
export class UserBalanceModule {}
