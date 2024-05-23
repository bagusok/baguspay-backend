import { Module } from '@nestjs/common';
import { ServiceGroupService } from './service-group.service';
import { ServiceGroupController } from './service-group.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  providers: [ServiceGroupService],
  controllers: [ServiceGroupController],
  imports: [PrismaModule],
  exports: [ServiceGroupService],
})
export class ServiceGroupModule {}
