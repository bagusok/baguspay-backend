import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/roles.decorator';
import { IUserRequest } from '../transaction/transaction.controller';
import { CreateDepositDto, UpdateDepositDto } from './deposit.dto';
import { DepositStatus, Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Deposit')
@ApiSecurity('access-token')
@Controller()
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('user/deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER, Role.ADMIN])
  async createDeposit(
    @Req() req: IUserRequest,
    @Body() body: CreateDepositDto,
  ) {
    return await this.depositService.createDeposit(req.user?.id, body);
  }

  @Get('user/deposit/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER, Role.ADMIN])
  async getDepositHistory(
    @Req() req: IUserRequest,
    @Query() q: { page?: number; limit?: number },
  ) {
    console.log('USER ID', req.user.id);
    return await this.depositService.getDepositByUser(req.user?.id, {
      page: q?.page ?? 1,
      limit: q?.limit ?? 10,
    });
  }

  @Get('user/deposit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.USER, Role.ADMIN])
  async getDeposit(@Req() req: IUserRequest, @Param('id') id: string) {
    return await this.depositService.getDepositDetail(id, req.user?.id);
  }

  @Get('admin/deposit')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllDepositByAdmin(
    @Query()
    query: {
      page: number;
      limit: number;
      searchBy?: 'id' | 'userId';
      sortBy?: string;
      searchQuery?: string;
      depositStatus: DepositStatus;
      from: Date;
      to: Date;
    },
  ) {
    return await this.depositService.getAllDepositByAdmin({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      searchBy: query.searchBy,
      sortBy: query.sortBy ?? 'createdAt.desc',
      searchQuery: query.searchQuery,
      depositStatus: query.depositStatus,
      from: query.from,
      to: query.to,
    });
  }

  @Get('admin/deposit/:id')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDepositById(@Param('id') id: string) {
    return await this.depositService.getDepositById(id);
  }

  @Post('admin/deposit/update-status')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateDepositStatus(@Body() body: UpdateDepositDto) {
    return await this.depositService.updateStatusDeposit(body);
  }
}
