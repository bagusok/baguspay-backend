import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Request } from 'express';
import {
  cancelTransactionDto,
  createInquiryDto,
  createTransactionDto,
  PayInquiryDto,
  UpdateStatusTransactionDto,
} from './dtos/transaction.dto';
import { Roles } from 'src/common/roles.decorator';
import { OrderStatus, PaidStatus, Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';

export interface IUserRequest extends Request {
  user: {
    id?: string;
    email?: string;
    role?: Role;
    token: string;
  } | null;
}

@ApiTags('Transaction')
@ApiSecurity('access-token')
@Controller('')
@UseGuards(TransactionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('transaction/list')
  @Roles([Role.ADMIN, Role.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllTransactions(
    @Req() req: IUserRequest,
    @Query()
    query?: {
      page: number;
      limit: number;
      sortBy: string;
      search: string;
    },
  ) {
    const transactions = await this.transactionService.getAllTransactions(
      req.user?.id ?? null,
      req.user?.role ?? null,
      {
        page: query?.page ?? 1,
        limit: query?.limit ?? 10,
        sortBy: query?.sortBy ?? 'createdAt',
        search: query?.search ?? '',
      },
    );

    return transactions;
  }

  @Post('transaction/create')
  @UseGuards(TransactionGuard)
  async createTransaction(
    @Req() req: IUserRequest,
    @Body() body: createTransactionDto,
  ) {
    const userId = req.user?.id ?? null;

    return await this.transactionService.createTransaction(userId, body);
  }

  @Post('transaction/cancel')
  @Roles([Role.ADMIN])
  async cancelTransaction(
    @Body() body: cancelTransactionDto,
    @Req() req: IUserRequest,
  ) {
    try {
      const transaction = await this.transactionService.cancelTransaction(
        req.user?.id ?? null,
        null,
        body.trxId,
      );

      if (!transaction) {
        return {
          status: 500,
          message: 'Failed to cancel transaction',
        };
      }

      return transaction;
    } catch (error) {
      return new InternalServerErrorException(error);
    }
  }

  @Get('transaction/detail/:id')
  @ApiParam({ name: 'id', required: true })
  async getTransactionDetail(@Req() req: IUserRequest) {
    return await this.transactionService.getTransactionById(req.params.id);
  }

  @Post('transaction/inquiry')
  @UseGuards(TransactionGuard)
  async inquiryTransaction(
    @Req() req: IUserRequest,
    @Body()
    body: createInquiryDto,
  ) {
    const userId = req.user?.id ?? null;

    return await this.transactionService.createInquiry({
      userId,
      ...body,
    });
  }

  @Get('transaction/inquiry/detail/:id')
  @UseGuards(TransactionGuard)
  async getInquiry(@Param('id') id: string, @Req() req: IUserRequest) {
    return await this.transactionService.getInquiryById(
      id,
      req.user?.id ?? null,
    );
  }

  @Post('transaction/inquiry/pay')
  async payInquiry(@Req() req: IUserRequest, @Body() body: PayInquiryDto) {
    return await this.transactionService.payInquiry(body, req.user?.id ?? null);
  }

  @Get('admin/transactions')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransactions(
    @Query()
    query: {
      page: number;
      limit: number;
      searchBy?: 'id' | 'userId';
      sortBy?: string;
      searchQuery?: string;
      paidStatus: PaidStatus;
      orderStatus: OrderStatus;
      from: Date;
      to: Date;
    },
  ) {
    return await this.transactionService.getAllTransactionByAdmin({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      searchBy: query.searchBy,
      sortBy: query.sortBy ?? 'createdAt.desc',
      searchQuery: query.searchQuery,
      paidStatus: query.paidStatus,
      orderStatus: query.orderStatus,
      from: query.from,
      to: query.to,
    });
  }

  @Get('admin/transactions/:id')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransactionById(@Param('id') id: string) {
    return await this.transactionService.getTransactionById(id);
  }

  @Post('admin/transactions/update-status')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateTransactionStatus(
    @Body()
    body: UpdateStatusTransactionDto,
  ) {
    return await this.transactionService.updateStatusTransaction(body);
  }
}
