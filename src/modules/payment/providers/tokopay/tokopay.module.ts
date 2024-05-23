import { Module } from '@nestjs/common';
import { TokopayService } from './tokopay.service';

@Module({
  providers: [TokopayService],
  exports: [TokopayService],
})
export class TokopayModule {}
