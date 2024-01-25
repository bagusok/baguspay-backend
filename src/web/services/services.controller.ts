import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { ServicesService } from './services.service';
import { Request, Response } from 'express';
import { createServicesDto, updateServicesDto } from './dtos/services.dto';

@ApiTags('Services')
@ApiSecurity('access-token')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(['ADMIN'])
  async getServices(@Req() req: Request, @Res() res: Response) {
    const services = await this.servicesService.findAll();

    if (!services) {
      throw new BadRequestException('Error getting services');
    }

    return res.status(200).json({
      message: 'Services get successfully',
      data: services,
    });
  }

  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  @Roles(['ADMIN'])
  async getServicesById(@Req() req: Request) {
    const { id } = req.params;

    return await this.servicesService.findById(id);
  }

  @Post('create')
  @Roles(['ADMIN'])
  async createService(
    @Req() req: Request,

    @Body() body: createServicesDto,
  ) {
    return await this.servicesService.create(body);
  }

  @Post('update')
  @Roles(['ADMIN'])
  async updateService(@Req() req: Request, @Body() body: updateServicesDto) {
    return await this.servicesService.update(body.id, body);
  }

  @ApiParam({ name: 'id', type: String })
  @Get('delete/:id')
  @Roles(['ADMIN'])
  async deleteService(@Req() req: Request) {
    const { id } = req.params;

    return await this.servicesService.delete(id);
  }
}
