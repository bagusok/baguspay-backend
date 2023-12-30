import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPaymentMethods() {
    return this.prismaService.paymentMethod.findMany();
  }

  async getPaymentMethodById(id: string) {
    return this.prismaService.paymentMethod.findUnique({
      where: { id },
    });
  }

  async createPaymentMethod(data: Prisma.PaymentMethodCreateInput) {
    return this.prismaService.paymentMethod.create({
      data,
    });
  }

  async updatePaymentMethod(id: string, data: Prisma.PaymentMethodUpdateInput) {
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
    return this.prismaService.paymentMethod.deleteMany();
  }
}
