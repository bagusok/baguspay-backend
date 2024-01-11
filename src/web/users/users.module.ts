import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UiModule } from './ui/ui.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, UiModule],
})
export class UsersModule {}
