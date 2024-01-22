import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [BannerService],
  controllers: [BannerController],
  imports: [PrismaModule],
})
export class BannerModule {}
