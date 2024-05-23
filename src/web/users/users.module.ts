import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { UiModule } from './ui/ui.module';
import { BalanceController } from './balance/balance.controller';
import { BalanceModule } from 'src/modules/payment/providers/balance/balance.module';

@Module({
  controllers: [UsersController, BalanceController],
  providers: [UsersService],
  imports: [PrismaModule, UiModule, BalanceModule],
})
export class UsersModule {}
