import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { ServiceGroupService } from './service-group.service';
import {
  CreateServiceGroupDto,
  DeleteServiceGroupDto,
  UpdateServiceGroupDto,
} from './service-group.dto';
import { Role } from '@prisma/client';

@ApiTags('Service Group')
@ApiSecurity('access-token')
@Controller('admin/service-group')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceGroupController {
  constructor(private readonly serviceGroup: ServiceGroupService) {}

  @Get()
  @Roles([Role.ADMIN])
  async getServiceGroup() {
    return await this.serviceGroup.findAll();
  }

  @Post('create')
  @Roles([Role.ADMIN])
  async createServiceGroup(@Body() body: CreateServiceGroupDto) {
    return await this.serviceGroup.create(body);
  }

  @Post('update')
  @Roles([Role.ADMIN])
  async updateServiceGroup(@Body() body: UpdateServiceGroupDto) {
    const update = await this.serviceGroup.update(body);
    return update;
  }

  @Post('delete')
  @Roles([Role.ADMIN])
  async deleteServiceGroup(@Body() body: DeleteServiceGroupDto) {
    const del = await this.serviceGroup.delete(body);
    return del;
  }
}
