import {
  Controller,
  Get,
  NotFoundException,
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
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get()
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    console.log(req.user);

    const get = await this.usersService.findAll();
    if (!get) {
      return new NotFoundException('No users found');
    }

    return res.status(200).json({
      message: 'Users found',
      data: get,
    });
  }

  @Get('/ping')
  @UseGuards(TransactionGuard)
  async ping(@Req() req: Request) {
    console.log('user', req.user);
    return await this.usersService.findUser(req.user);
  }

  @Get('/balance/mutation')
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

  @Get('/balance')
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

  @Get('/deposit/get-payment')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPaymentDeposit() {
    return await this.usersService.getPaymentDeposit();
  }
}
