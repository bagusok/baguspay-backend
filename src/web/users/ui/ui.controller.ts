import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ServicesService } from 'src/web/services/services.service';

@ApiTags('ui')
@Controller('ui')
export class UiController {
  constructor(private readonly serviceService: ServicesService) {}

  @ApiQuery({ name: 'slug', required: true })
  @Get('services')
  async getService(@Query('slug') slug: string) {
    if (!slug) {
      throw new NotFoundException('Slug not found');
    }
    const get = await this.serviceService.findServicesBySlug(slug);

    return {
      statusCode: 200,
      message: 'Success',
      data: get,
    };
  }
}
