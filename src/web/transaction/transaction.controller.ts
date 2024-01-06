import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Request } from 'express';
import {
  cancelTransactionDto,
  createTransactionDto,
} from './dtos/transaction.dto';
import { Roles } from 'src/common/roles.decorator';
import { TransactionGuard } from './transaction.guard';

export interface IUserRequest extends Request {
  user: {
    id?: string;
    email?: string;
    role?: string;
  } | null;
}

@ApiTags('Transaction')
@ApiSecurity('access-token')
@Controller('transaction')
@Roles(['ADMIN', 'USER'])
@UseGuards(TransactionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
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
