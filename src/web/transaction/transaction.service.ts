import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentService } from 'src/modules/payment/payment.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { createTransactionDto } from './dtos/transaction.dto';
import { QueueService } from 'src/queue/queue.service';
import { CustomError } from 'src/common/custom.error';
import { Role } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly queueService: QueueService,
  ) {}

  async getAllTransactions(
    userId = null,
    role: Role | null = null,
    {
      page = 1,
      limit = 10,
      sortBy = 'createdAt.desc',
      search = null,
    }: {
      page: number;
      limit: number;
      sortBy: string;
      search: string;
    },
  ) {
    try {
      const user = userId && role == 'USER' ? { userId } : {};

      const orderBy = {
        [sortBy.split('.')[0]]: sortBy.split('.')[1],
      };

      const _search = search
        ? {
            [search.split('.')[0]]: {
              contains: search.split('.')[1],
              mode: 'insensitive',
            },
          }
        : {};

      const getTrx = await this.prismaService.transactions.findMany({
        where: {
          ...user,
          ..._search,
        },
        orderBy: {
          ...orderBy,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const getCount = await this.prismaService.transactions.count({
        where: {
          ...user,
          ..._search,
        },
      });

      return {
        statusCode: 200,
        message: 'Success',
        pagination: {
          page,
          limit,
          totalPage: getCount / limit,
          totalData: getCount,
        },
        data: getTrx,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async getTransactionById(id: string) {
    try {
      const getTrx = await this.prismaService.transactions.findUnique({
        where: { id },
        include: {
          paymentMethod: true,
        },
      });

      if (!getTrx) {
        throw new CustomError(HttpStatus.NOT_FOUND, 'Transaction not found');
      }

      return {
        statusCode: 200,
        message: 'Success',
        data: getTrx,
      };
    } catch (err) {
      throw new HttpException(
        err.publicMessage || 'Internal Server Error',
        err.statusCode || 500,
      );
    }
  }

  async createTransaction(userId: string, data: createTransactionDto) {
    let time = 0;
    const setTime = setInterval(() => {
      time++;
    }, 1000);

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

      if (checkPaymentMethod.type == 'SALDO' && userId == null) {
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
          productGroup: {
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

      if (!checkProduct) {
        return {
          status: 503,
          message: 'Product not available',
        };
      }

      if (checkProduct.stock < 1 || checkProduct.stock < data.productQty) {
        return {
          status: 503,
          message: 'Product stock is empty',
        };
      }

      const transaction = await this.prismaService.$transaction(
        async (tx) => {
          await tx.products.update({
            where: {
              id: checkProduct.id,
            },
            data: {
              stock: checkProduct.stock - data.productQty,
            },
          });

          const expiredAt =
            new Date().getTime() +
            1000 * 60 * checkPaymentMethod.expiredInMinutes;

          const trxId = await this.generateTransactionId();

          const price = checkProduct.price * data.productQty;
          const totalPrice =
            Math.ceil(
              (price / (100 - Number(checkPaymentMethod.feesInPercent))) * 100,
            ) + checkPaymentMethod.fees;

          const fees = totalPrice - price;
          console.log(price, fees, totalPrice);

          if (
            totalPrice <= checkPaymentMethod.minAmount ||
            totalPrice >= checkPaymentMethod.maxAmount
          )
            throw new CustomError(404, 'Payment method not available');

          const createTransaction = await tx.transactions.create({
            data: {
              id: trxId,
              price: price,
              productQty: data.productQty,
              fees: fees,
              productName: checkProduct.name,
              productId: checkProduct.id,
              paymentName: checkPaymentMethod.name,
              idPaymentProvider: checkPaymentMethod.providerId,
              paymentMethodType: checkPaymentMethod.type,
              paymentMethodId: checkPaymentMethod.id,
              productPrice: checkProduct.price,
              totalPrice: price + fees,
              productService:
                checkProduct?.productGroup?.Services?.name ?? 'Nothing',
              expiredAt: new Date(expiredAt),
              userId: userId,
              inputData: data.inputData,
              outputData: data.outputData,
            },
          });

          if (!createTransaction) {
            throw new CustomError(422, 'Failed to create transaction');
          }

          const createPayment = await this.paymentService.createPayment({
            userId: userId,
            type: checkPaymentMethod.type,
            amount: createTransaction.price,
            amountTotal: createTransaction.totalPrice,
            fees: fees,
            feesInPercent: checkPaymentMethod.feesInPercent,
            description: createTransaction.productName,
            idPaymentMethodProvider: checkPaymentMethod.providerId,
            paymentMethodProvider: checkPaymentMethod.provider,
            trxId: createTransaction.id,
            phone: data?.phone,
            validTime: checkPaymentMethod.expiredInMinutes * 60,
          });

          if (!createPayment) {
            throw new CustomError(422, 'Failed to create payment');
          }

          const profit =
            totalPrice -
            fees -
            checkProduct.priceFromProvider * data.productQty;

          const updateTransaction = await tx.transactions.update({
            where: {
              id: createTransaction.id,
            },
            data: {
              paidStatus: createPayment.status,
              // expiredAt: new Date(createPayment.expired),
              fees: Number(createPayment.fee),
              profit: profit,
              price: price,
              paymentNumber: createPayment.pay_code,
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

            throw new CustomError(422, 'Failed to update transaction');
          }

          return updateTransaction;
        },
        { timeout: 20000 },
      );

      clearInterval(setTime);

      if (transaction.paidStatus == 'PAID') {
        await this.queueService.addTransactionProcessJob({
          trxId: transaction.id,
          status: 'PAID',
          userId: userId,
        });
      }

      return {
        statusCode: 200,
        message: 'Success',
        time: time + 's',
        data: transaction,
      };
    } catch (error) {
      clearInterval(setTime);
      console.log(error);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
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
}
