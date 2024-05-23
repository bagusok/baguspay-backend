import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  providers: [BalanceService],
  imports: [PrismaModule],
  exports: [BalanceService],
})
export class BalanceModule {}
