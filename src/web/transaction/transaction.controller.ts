import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Request } from 'express';
import {
  cancelTransactionDto,
  createTransactionDto,
  getAllTransactionsDto,
} from './dtos/transaction.dto';
import { Roles } from 'src/common/roles.decorator';
import { TransactionGuard } from './transaction.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

export interface IUserRequest extends Request {
  user: {
    id?: string;
    email?: string;
    role?: 'ADMIN' | 'USER' | 'RESELLER';
  } | null;
}

@ApiTags('Transaction')
@ApiSecurity('access-token')
@Controller('transaction')
@UseGuards(TransactionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('list')
  @Roles(['ADMIN', 'USER', 'RESELLER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllTransactions(
    @Req() req: IUserRequest,
    @Query() query?: getAllTransactionsDto,
  ) {
    try {
      const transactions = await this.transactionService.getAllTransactions(
        req.user?.id ?? null,
        req.user?.role ?? null,
        query.page,
        query.limit,
        query.paidStatus,
        query.orderStatus,
        query.trxId,
      );

      if (!transactions) {
        throw new InternalServerErrorException('Failed to get transactions');
      }

      return transactions;
    } catch (error) {
      return new InternalServerErrorException(error);
    }
  }

  @Post('create')
  @Roles(['ADMIN'])
  async createTransaction(
    @Req() req: IUserRequest,
    @Body() body: createTransactionDto,
  ) {
    try {
      const userId = req.user?.id ?? null;

      const transaction = await this.transactionService.createTransaction(
        userId,
        body,
      );

      if (!transaction) {
        return {
          status: 500,
          message: 'Failed to create transaction',
        };
      }

      return transaction;
    } catch (error) {
      return new InternalServerErrorException(error);
    }
  }

  @Post('cancel')
  @Roles(['ADMIN'])
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
}
