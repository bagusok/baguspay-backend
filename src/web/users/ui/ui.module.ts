import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServicesModule } from 'src/web/services/services.module';

@Module({
  providers: [UiService],
  controllers: [UiController],
  imports: [PrismaModule, ServicesModule],
})
export class UiModule {}
