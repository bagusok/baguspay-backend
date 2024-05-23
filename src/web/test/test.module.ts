import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  controllers: [TestController],
  imports: [QueueModule],
})
export class TestModule {}
