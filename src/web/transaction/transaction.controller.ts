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
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Request } from 'express';
import {
  cancelTransactionDto,
  createTransactionDto,
} from './dtos/transaction.dto';
import { Roles } from 'src/common/roles.decorator';
import { TransactionGuard } from './transaction.guard';
import { Role } from '@prisma/client';

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
@Controller('transaction')
@UseGuards(TransactionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('list')
  @UseGuards(TransactionGuard)
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

  @Post('create')
  async createTransaction(
    @Req() req: IUserRequest,
    @Body() body: createTransactionDto,
  ) {
    const userId = req.user?.id ?? null;

    return await this.transactionService.createTransaction(userId, body);
  }

  @Post('cancel')
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

  @Get('detail/:id')
  @ApiParam({ name: 'id', required: true })
  async getTransactionDetail(@Req() req: IUserRequest) {
    return await this.transactionService.getTransactionById(req.params.id);
  }
}
