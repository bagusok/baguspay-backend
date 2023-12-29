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
@Roles(['ADMIN'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
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
  async getServicesById(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;

    const service = await this.servicesService.findById(id);

    if (!service) {
      throw new BadRequestException('Error getting service');
    }

    return res.status(200).json({
      message: 'Service get successfully',
      data: service,
    });
  }

  @Post('create')
  async createService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: createServicesDto,
  ) {
    const service = await this.servicesService.create(body);

    if (!service) {
      throw new BadRequestException('Error creating service');
    }

    return res.status(200).json({
      message: 'Service created successfully',
      data: service,
    });
  }

  @Post('update')
  async updateService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: updateServicesDto,
  ) {
    const service = await this.servicesService.update(body.id, body);

    if (!service) {
      throw new BadRequestException('Error updating service');
    }

    return res.status(200).json({
      message: 'Service updated successfully',
      data: service,
    });
  }

  @ApiParam({ name: 'id', type: String })
  @Get('delete/:id')
  async deleteService(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;

    const service = await this.servicesService.delete(id);

    if (!service) {
      throw new BadRequestException('Error deleting service');
    }

    return res.status(200).json({
      message: 'Service deleted successfully',
      data: service,
    });
  }
}
