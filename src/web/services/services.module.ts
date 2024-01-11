import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceGroupModule } from './service-group/service-group.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [PrismaModule, ServiceGroupModule],
  exports: [ServicesService],
})
export class ServicesModule {}
