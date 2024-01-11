import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServicesModule } from 'src/web/services/services.module';
import { ServiceGroupModule } from 'src/web/services/service-group/service-group.module';

@Module({
  providers: [UiService],
  controllers: [UiController],
  imports: [PrismaModule, ServicesModule, ServiceGroupModule],
})
export class UiModule {}
