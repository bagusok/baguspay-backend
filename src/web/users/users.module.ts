import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { UiModule } from './ui/ui.module';
import { BalanceModule } from 'src/modules/payment/providers/balance/balance.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserBalanceModule } from './user-balance/user-balance.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    PrismaModule,
    UiModule,
    BalanceModule,
    AuthModule,
    UserBalanceModule,
    JwtModule,
  ],
})
export class UsersModule {}
