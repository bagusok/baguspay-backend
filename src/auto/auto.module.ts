import { Module } from '@nestjs/common';
import { AutoService } from './auto.service';
import { AutoController } from './auto.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { DigiflazzModule } from 'src/modules/h2hprovider/digiflazz/digiflazz.module';

@Module({
  providers: [AutoService],
  controllers: [AutoController],
  imports: [PrismaModule, DigiflazzModule],
})
export class AutoModule {}
