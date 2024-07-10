import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IUserRequest } from '../transaction/transaction.controller';
import { BalanceService } from 'src/modules/payment/providers/balance/balance.service';
import { Role } from '@prisma/client';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';

@ApiTags('Users')
@ApiSecurity('access-token')
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get('users/ping')
  @UseGuards(TransactionGuard)
  async ping(@Req() req: Request) {
    console.log('user', req.user);
    return await this.usersService.findUser(req.user);
  }

  @Get('users/balance/mutation')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBalanceMutation(
    @Req() req: IUserRequest,
    @Query()
    query: {
      page: number;
      limit: number;
    },
  ) {
    return await this.balanceService.getBalanceMutation(req.user.id, query);
  }

  @Get('users/balance')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBalance(@Req() req: IUserRequest, @Res() res: Response) {
    const getBalance = await this.balanceService.getBalance(req.user.id);
    return res.status(200).json({
      statusCode: 200,
      message: 'Success',
      data: getBalance,
    });
  }

  @Get('users/deposit/get-payment')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPaymentDeposit() {
    return await this.usersService.getPaymentDeposit();
  }

  @Get('admin/users')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsersByAdmin(
    @Query()
    query: {
      page: number;
      limit: number;
      searchBy?: 'id' | 'username' | 'email';
      sortBy?: string;
      searchQuery?: string;
      from: Date;
      to: Date;
    },
  ) {
    return await this.usersService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      searchBy: query.searchBy,
      sortBy: query.sortBy ?? 'createdAt.desc',
      searchQuery: query.searchQuery,
      from: query.from,
      to: query.to,
    });
  }

  @Get('admin/users/balance-mutation')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserBalanceMutasionByAdmin(
    @Query()
    query: {
      page: number;
      limit: number;
      searchBy?: 'id' | 'userId';
      sortBy?: string;
      searchQuery?: string;
      from: Date;
      to: Date;
    },
  ) {
    return await this.usersService.getUsersBalanceMutation({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      searchBy: query.searchBy,
      sortBy: query.sortBy ?? 'createdAt.desc',
      searchQuery: query.searchQuery,
      from: query.from,
      to: query.to,
    });
  }

  @Get('admin/users/:id')
  async getUserById(@Req() req: Request, @Param('id') id: string) {
    return await this.usersService.getUserDetailByAdmin(id);
  }

  @Get('users/chart/transaction/:userId')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChartTransactionByUser(
    @Req() req: IUserRequest,
    @Param('userId') userId: string,
  ) {
    return await this.usersService.getChartTransactionByUser(userId);
  }

  @Get('users/chart/balance-mutation/:userId')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChartBalanceMutationByUser(
    @Req() req: IUserRequest,
    @Param('userId') userId: string,
  ) {
    return await this.usersService.getChartBalanceMutationByUser(userId);
  }

  @Get('users/:userId/info')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserInfo(@Req() req: IUserRequest, @Param('userId') userId: string) {
    return await this.usersService.getUserDetail(userId);
  }
}
