import { HttpException, Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/custom.error';
import { BalanceService } from 'src/modules/payment/providers/balance/balance.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserBalanceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly balanceService: BalanceService,
  ) {}

  async getBalance(userId: string) {
    const balance = this.balanceService.getBalance(userId);
    return {
      statusCode: 200,
      data: {
        balance,
      },
    };
  }

  async getBalanceHistory(userId, take = 15, skip = 0) {
    try {
      const getMutation = await this.prismaService.balanceMutation.findMany({
        where: {
          userId,
        },
        take,
        skip,
      });

      if (!getMutation) {
        throw new CustomError(404, 'Balance history not found');
      }

      return {
        statusCode: 200,
        message: 'Balance history fetched successfully',
        data: getMutation,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }
}
