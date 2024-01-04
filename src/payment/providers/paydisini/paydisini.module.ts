import { Module } from '@nestjs/common';
import { PaydisiniService } from './paydisini.service';

@Module({
  providers: [PaydisiniService],
  exports: [PaydisiniService],
})
export class PaydisiniModule {}
