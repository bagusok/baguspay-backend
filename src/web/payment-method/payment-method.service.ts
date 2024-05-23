import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdatePaymentMethodDto } from './dtos/payment-method.dto';
import { CustomError } from 'src/common/custom.error';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPaymentMethods({
    limit = 10,
    page = 1,
    sortBy = 'createdAt.desc',
  }) {
    const data = await this.prismaService.paymentMethod.findMany({
      take: Number(limit),
      skip: (page - 1) * limit,
      orderBy: {
        [sortBy.split('.')[0]]: sortBy.split('.')[1],
      },
    });

    const count = await this.prismaService.paymentMethod.count();

    return {
      statusCode: 200,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalData: count,
        totalPage: Math.ceil(count / limit),
      },
      data,
    };
  }

  async getPaymentMethodById(id: string) {
    try {
      const getPay = await this.prismaService.paymentMethod.findUnique({
        where: { id },
      });

      if (!getPay) {
        throw new CustomError(404, 'Payment method not found');
      }

      return {
        statusCode: 200,
        data: getPay,
      };
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        err.publicMessage ?? 'Internal Server Error',
        err.statusCode,
      );
    }
  }

  async createPaymentMethod(data: Prisma.PaymentMethodCreateInput) {
    return await this.prismaService.paymentMethod.create({
      data,
    });
  }

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodDto) {
    const check = await this.getPaymentMethodById(id);

    if (!check) {
      throw new NotFoundException('Payment method not found');
    } else {
      return this.prismaService.paymentMethod.update({
        where: { id },
        data,
      });
    }
  }

  async deletePaymentMethod(id: string) {
    const check = await this.getPaymentMethodById(id);

    if (!check) {
      throw new NotFoundException('Payment method not found');
    } else {
      return this.prismaService.paymentMethod.delete({
        where: { id },
      });
    }
  }

  async deleteManyPaymentMethods() {
    return await this.prismaService.paymentMethod.deleteMany();
  }
}
