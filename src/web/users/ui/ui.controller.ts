import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ServiceGroupService } from 'src/web/services/service-group/service-group.service';
import { ServicesService } from 'src/web/services/services.service';

@ApiTags('ui')
@Controller('ui')
export class UiController {
  constructor(
    private readonly serviceService: ServicesService,
    private readonly serviceGroupService: ServiceGroupService,
  ) {}

  @ApiParam({ name: 'slug', required: true })
  @Get('services/:slug')
  async getServiceBySlug(@Param('slug') slug: string) {
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

  @Get('services')
  async getAllService() {
    const get = await this.serviceService.findAllByUser();

    return {
      statusCode: 200,
      message: 'Success',
      data: get,
    };
  }

  @Get('service-group')
  async getAllServiceGroup() {
    return await this.serviceGroupService.findAllByUser();
  }
}
