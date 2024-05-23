import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QueueService } from 'src/queue/queue.service';

@Controller('test')
@ApiTags('Test')
export class TestController {
  constructor(private readonly queueService: QueueService) {}

  @Get('add-queue')
  async addQueue(@Res() res: Response) {
    await this.queueService.addTransactionProcessJob({
      trxId: '123',
      userId: '123',
      status: 'PROCESS',
    });
    return res.status(200).json({ message: 'Success add queue job' });
  }
}
