import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async getAllTransactions() {
    return this.prismaService.transactions.findMany();
  }

  async getTransactionById(id: string) {
    return this.prismaService.transactions.findUnique({
      where: { id },
    });
  }

  async createTransaction(userId: string, data: any) {
    try {
      const checkPaymentMethod =
        await this.prismaService.paymentMethod.findFirst({
          where: {
            id: data.paymentMethodId,
          },
        });

      if (!checkPaymentMethod) {
        return {
          status: 503,
          message: 'Payment method not available',
        };
      }

      const checkProduct = await this.prismaService.products.findFirst({
        where: {
          id: data!.productId,
          isAvailable: true,
        },
      });

      if (!checkProduct) {
        return {
          status: 503,
          message: 'Product not available',
        };
      }

      const transaction = await this.prismaService.$transaction(async (tx) => {
        const expiredAt = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;

        const uuid = crypto.randomBytes(16).toString('hex').toString();
        const percentToDesimal = Number(checkPaymentMethod.feesInPercent) / 100;

        const fees = Math.round(
          percentToDesimal * checkProduct.price + checkPaymentMethod.fees,
        );

        const createTransaction = await tx.transactions.create({
          data: {
            id: uuid,
            price: checkProduct.price,
            fees: fees,
            productName: checkProduct.name,
            productId: checkProduct.id,
            paymentMethodType: checkPaymentMethod.type,
            paymentMethodId: checkPaymentMethod.id,
            productPrice: checkProduct.price,
            totalPrice: checkProduct.price + fees,
            productService: 'productService',
            expiredAt: new Date(expiredAt),
            userId: userId,
          },
        });

        if (!createTransaction) {
          throw new Error('Failed to create transaction');
        }

        const createPayment = await this.paymentService.createPayment({
          amount: createTransaction.totalPrice,
          description: createTransaction.productName,
          idPaymentMethodProvider: checkPaymentMethod.providerId,
          paymentMethodProvider: checkPaymentMethod.provider,
          trxId: createTransaction.id,
        });

        if (!createPayment) {
          throw new Error('Failed to create payment');
        }

        const updateTransaction = await tx.transactions.update({
          where: {
            id: createTransaction.id,
          },
          data: {
            expiredAt: new Date(createPayment.expired),
            fees: Number(createPayment.fee) + Number(fees),
            price: Number(createPayment.amount),
            isQrcode: createPayment.isQrcode,
            linkPayment: createPayment.linkPayment,
            qrData: createPayment.qrData,
            totalPrice: Number(createPayment.amount),
          },
        });

        if (!updateTransaction) {
          await this.paymentService.cancelPayment({
            trxId: createTransaction.id,
            paymentMethodProvider: checkPaymentMethod.provider,
          });

          throw new Error('Failed to update transaction');
        }

        return updateTransaction;
      });

      return {
        status: 200,
        message: 'Success',
        data: transaction,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
