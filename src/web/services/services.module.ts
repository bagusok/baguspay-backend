import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [PrismaModule],
})
export class ServicesModule {}
