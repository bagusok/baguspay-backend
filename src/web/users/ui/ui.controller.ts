import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ServiceGroupService } from 'src/web/services/service-group/service-group.service';
import { ServicesService } from 'src/web/services/services.service';
import { getPaymentMethodDto, getPaymentMethodInquiryDto } from './dtos/ui.dto';
import { UiService } from './ui.service';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';
import { IUserRequest } from 'src/web/transaction/transaction.controller';

@ApiTags('ui')
@ApiSecurity('access-token')
@Controller('ui')
export class UiController {
  constructor(
    private readonly serviceService: ServicesService,
    private readonly serviceGroupService: ServiceGroupService,
    private readonly uiService: UiService,
  ) {}

  @ApiParam({ name: 'slug', required: true })
  @Get('services/:slug')
  async getServiceBySlug(@Param('slug') slug: string) {
    if (!slug) {
      throw new NotFoundException('Slug not found');
    }

    return await this.serviceService.findServicesBySlug(slug);
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

  @Post('payment-method')
  @UseGuards(TransactionGuard)
  async getPaymentMethod(
    @Body() body: getPaymentMethodDto,
    @Req() req: IUserRequest,
  ) {
    return await this.uiService.getPaymentMethod(body, req.user?.id ?? null);
  }

  @Post('payment-method-inquiry')
  @UseGuards(TransactionGuard)
  async getPaymentMethodInquiry(
    @Body() body: getPaymentMethodInquiryDto,
    @Req() req: IUserRequest,
  ) {
    return await this.uiService.getPaymentMethodInquiry(
      body,
      req.user?.id ?? null,
    );
  }
}
