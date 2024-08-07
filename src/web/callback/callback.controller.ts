import { Body, Controller, Post, Req } from '@nestjs/common';
import { CallbackService } from './callback.service';

@Controller('callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}

  @Post('paydisini')
  async paydisiniCallback(@Body() data: any) {
    console.log(data);

    return await this.callbackService.paydisiniCallback(data);
  }

  @Post('digiflazz')
  async digiflazzService(@Body() data: any, @Req() req: any) {
    return await this.callbackService.digiflazzCallback(req, data);
  }
}
