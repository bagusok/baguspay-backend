import { HttpException, Injectable } from '@nestjs/common';
import { BalanceRefType } from '@prisma/client';
import { CustomError } from 'src/common/custom.error';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class BalanceService {
  constructor(private readonly prismaService: PrismaService) {}

  async getBalance(userId: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        balance: true,
      },
    });
  }

  async addBalance(
    userId: string,
    amount: number,
    name: string,
    refId: string,
    refType: BalanceRefType,
    notes?: string,
  ) {
    const getBalance = await this.getBalance(userId);

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          increment: amount,
        },
        BalanceMutation: {
          create: {
            name,
            amount,
            notes,
            refType,
            type: 'IN',
            oldBalance: getBalance.balance,
            newBalance: getBalance.balance + amount,
            refId,
          },
        },
      },
    });
  }

  async deductBalance(
    userId: string,
    amount: number,
    name: string,
    refId: string,
    refType: BalanceRefType,
    notes?: string,
  ) {
    const getBalance = await this.getBalance(userId);

    if (getBalance.balance < amount) {
      throw new CustomError(400, 'Balance is not enough');
    }

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          decrement: amount,
        },
        BalanceMutation: {
          create: {
            name,
            amount,
            notes,
            refType,
            type: 'OUT',
            oldBalance: getBalance.balance,
            newBalance: getBalance.balance - amount,
            refId,
          },
        },
      },
    });
  }

  async getBalanceMutation(
    userId: string,
    {
      page = 1,
      limit = 10,
    }: {
      page?: number;
      limit?: number;
    },
  ) {
    try {
      const getMutation = await this.prismaService.balanceMutation.findMany({
        where: {
          userId,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const getCount = await this.prismaService.balanceMutation.count({
        where: {
          userId,
        },
      });

      return {
        statusCode: 200,
        data: getMutation,
        pagination: {
          page,
          limit,
          totalPage: Math.ceil(getCount / limit),
        },
      };
    } catch (err) {
      throw new HttpException(err.publicMessage, err.status);
    }
  }
}
