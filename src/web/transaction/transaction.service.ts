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
        include: {
          ProductCategory: {
            include: {
              Services: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      console.log(checkProduct);

      if (!checkProduct) {
        return {
          status: 503,
          message: 'Product not available',
        };
      }

      const transaction = await this.prismaService.$transaction(async (tx) => {
        const expiredAt = new Date().getTime() + 1000 * 60 * 60 * 2;

        const trxId = await this.generateTransactionId();

        const percentToDesimal = Number(checkPaymentMethod.feesInPercent) / 100;
        const fees = Math.round(
          percentToDesimal * checkProduct.price + checkPaymentMethod.fees,
        );

        const createTransaction = await tx.transactions.create({
          data: {
            id: trxId,
            price: checkProduct.price,
            fees: fees,
            productName: checkProduct.name,
            productId: checkProduct.id,
            paymentName: checkPaymentMethod.name,
            idPaymentProvider: checkPaymentMethod.providerId,
            paymentMethodType: checkPaymentMethod.type,
            paymentMethodId: checkPaymentMethod.id,
            productPrice: checkProduct.price,
            totalPrice: checkProduct.price + fees,
            productService:
              checkProduct?.ProductCategory?.Services?.name ?? 'Belum ada',
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
            price: checkProduct.price,
            isQrcode: createPayment.isQrcode,
            linkPayment: createPayment.linkPayment,
            qrData: createPayment.qrData,
            totalPrice: Number(createPayment.amount),
            paymentRef: createPayment.ref,
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

  private async generateTransactionId() {
    function rand() {
      const date = new Date().getTime().toString();
      const random = crypto.randomBytes(8).toString('hex').toUpperCase();

      return date + random;
    }

    let _rand = '';
    do {
      const gen = rand();
      const checkTransaction = await this.prismaService.transactions.findUnique(
        {
          where: {
            id: gen,
          },
        },
      );
      console.log(checkTransaction);

      if (!checkTransaction) {
        _rand = gen;
        break;
      }
    } while (true);

    return _rand;
  }

  async cancelTransaction(
    userId: string | null = null,
    deviceId: string | null = null,
    trxId: string,
  ) {
    try {
      const checkTransaction = await this.prismaService.transactions.findFirst({
        where: {
          id: trxId,
          userId: userId ?? null,
          paidStatus: 'PENDING',
          orderStatus: 'PENDING',
        },
        include: {
          paymentMethod: true,
        },
      });

      if (!checkTransaction) {
        return {
          status: 404,
          message: 'Transaction not found',
        };
      }

      if (checkTransaction.paidStatus !== 'PENDING') {
        return {
          status: 400,
          message: 'Transaction already paid, Cannot cancel transaction',
        };
      }

      const cancelPayment = await this.paymentService.cancelPayment({
        trxId: checkTransaction.id,
        paymentMethodProvider: checkTransaction.paymentMethod.provider,
      });

      if (!cancelPayment) {
        return {
          status: 500,
          message: 'Failed to cancel payment',
        };
      }

      const updateTransaction = await this.prismaService.transactions.update({
        where: {
          id: checkTransaction.id,
        },
        data: {
          orderStatus: 'CANCELLED',
          paidStatus: 'CANCELLED',
        },
      });

      if (!updateTransaction) {
        return {
          status: 500,
          message: 'Failed to cancel transaction',
        };
      }

      return {
        status: 200,
        message: 'Success  cancel transaction',
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
