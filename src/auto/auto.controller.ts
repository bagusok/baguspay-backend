import { AutoService } from './auto.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auto Generator')
@Controller('common/auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Get('generate/digiflazz-product')
  async generateDigiflazzProduct() {
    return this.autoService.getDigiflazzProduct();
  }
}
