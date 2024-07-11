import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentService } from 'src/modules/payment/payment.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  createTransactionDto,
  PayInquiryDto,
  UpdateStatusTransactionDto,
} from './dtos/transaction.dto';
import { QueueService } from 'src/queue/queue.service';
import { CustomError } from 'src/common/custom.error';
import {
  OrderStatus,
  PaidStatus,
  PaymentAllowAccess,
  Role,
} from '@prisma/client';
import { DigiflazzService } from 'src/modules/h2hprovider/digiflazz/digiflazz.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly queueService: QueueService,
    private readonly digiflazzService: DigiflazzService,
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
          totalPage: Math.round(getCount / limit),
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
      const checkProduct = await this.prismaService.products.findFirst({
        where: {
          id: data!.productId,
          isAvailable: true,
          type: {
            not: 'TAGIHAN',
          },
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

      const checkPaymentMethod =
        await this.prismaService.paymentMethod.findFirst({
          where: {
            id: data.paymentMethodId,
            minAmount: {
              lte: checkProduct.price * data.productQty,
            },
            maxAmount: {
              gte: checkProduct.price * data.productQty,
            },
            isAvailable: true,
            paymentAllowAccess: {
              hasSome: [PaymentAllowAccess.TRANSACTION],
            },
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
          console.log(price, fees, totalPrice, new Date(expiredAt));

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
        },
        include: {
          paymentMethod: true,
        },
      });

      if (!checkTransaction) {
        throw new CustomError(404, 'Transaction not found');
      }

      const cancelPayment = await this.paymentService.cancelPayment({
        trxId: checkTransaction.id,
        paymentMethodProvider: checkTransaction.paymentMethod.provider,
      });

      if (!cancelPayment) {
        throw new CustomError(422, 'Failed to cancel payment');
      }

      const updateTransaction = await this.prismaService.transactions.update({
        where: {
          id: checkTransaction.id,
        },
        data: {
          orderStatus: OrderStatus.CANCELED,
          paidStatus: PaidStatus.CANCELED,
        },
      });

      if (!updateTransaction) {
        throw new CustomError(422, 'Failed to cancel transaction');
      }

      return {
        status: 200,
        message: 'Success  cancel transaction',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  private async generateTransactionId(prexfix = 'T') {
    function rand() {
      const date = new Date().getTime().toString();
      const random = crypto.randomBytes(8).toString('hex').toUpperCase();

      return prexfix + date + random;
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

  async createInquiry(data: {
    productId: string;
    customerNumber: string;
    phoneNumber: string;
    userId?: string;
  }) {
    try {
      const findProduct = await this.prismaService.products.findFirst({
        where: {
          id: data.productId,
          isAvailable: true,
          type: 'TAGIHAN',
          h2hProvider: 'DIGIFLAZZ',
        },
      });

      if (!findProduct) {
        throw new CustomError(404, 'Product not found');
      }

      const parseCustomerNumber = data.customerNumber.replaceAll(':', '');
      const checkTagihan = await this.digiflazzService.checkTagihan({
        ref_id: await this.generateTransactionId('I'),
        buyer_sku_code: findProduct.idProductProvider,
        customer_no: parseCustomerNumber,
      });

      let status = 'FAILED';

      if (checkTagihan.data.status == 'Sukses') {
        status = 'SUCCESS';
      } else if (checkTagihan.data.status == 'Pending') {
        status = 'PENDING';
      }

      if (status == 'FAILED') {
        throw new CustomError(422, checkTagihan.data?.message);
      } else {
        const createInquiry =
          await this.prismaService.transactionInquiry.create({
            data: {
              customerNumber: parseCustomerNumber,
              customerName: checkTagihan.data.customer_name,
              productId: data.productId,
              userId: data.userId ?? null,
              price: checkTagihan.data.price,
              totalPrice: checkTagihan.data.selling_price,
              qty: checkTagihan.data.desc?.detail.length,
              fees: checkTagihan.data.selling_price - checkTagihan.data.price,
              id: checkTagihan.data.ref_id,
              inquiryData: checkTagihan.data.desc,
              inquiryType: 'TAGIHAN',
              phoneNumber: data.phoneNumber,
              status: status as OrderStatus,
            },
          });

        console.log(createInquiry);

        if (!createInquiry) {
          throw new CustomError(422, 'Failed to create inquiry');
        }

        return {
          statusCode: 200,
          message: 'Success',
          data: createInquiry,
        };
      }
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async getInquiryById(id: string, userId?: string) {
    try {
      const findInquiry = await this.prismaService.transactionInquiry.findFirst(
        {
          where: {
            id,
            ...(userId ? { userId } : {}),
          },
          include: {
            product: {
              select: {
                name: true,
                price: true,
                productGroup: {
                  select: {
                    Services: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      );

      if (!findInquiry) {
        throw new CustomError(404, 'Inquiry not found');
      }

      return {
        statusCode: 200,
        message: 'Get inquiry success',
        data: findInquiry,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async payInquiry(data: PayInquiryDto, userId?: string) {
    try {
      const checkInquiry =
        await this.prismaService.transactionInquiry.findFirst({
          where: {
            id: data.inquiryId,
            ...(userId ? { userId } : {}),
            status: OrderStatus.SUCCESS,
          },
          select: {
            customerName: true,
            customerNumber: true,
            inquiryData: true,
            phoneNumber: true,
            status: true,
            userId: true,
            inquiryProvider: true,
            id: true,
            totalPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                h2hProvider: true,
                idProductProvider: true,
                priceFromProvider: true,
                profit: true,
                type: true,
                productGroup: {
                  select: {
                    Services: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      if (!checkInquiry) {
        throw new CustomError(404, 'Inquiry not found');
      }

      const checkPaymentMethod =
        await this.prismaService.paymentMethod.findFirst({
          where: {
            id: data.paymentMethodId,
            minAmount: {
              lte: checkInquiry.totalPrice,
            },
            maxAmount: {
              gte: checkInquiry.totalPrice,
            },
            isAvailable: true,
            paymentAllowAccess: {
              hasSome: [PaymentAllowAccess.TRANSACTION],
            },
          },
        });

      if (!checkPaymentMethod) {
        throw new CustomError(404, 'Payment method not available');
      }

      const expiredAt =
        new Date().getTime() + 1000 * 60 * checkPaymentMethod.expiredInMinutes;

      const totalPrice =
        Math.ceil(
          (checkInquiry.totalPrice /
            (100 - Number(checkPaymentMethod.feesInPercent))) *
            100,
        ) + checkPaymentMethod.fees;

      const fees = totalPrice - checkInquiry.totalPrice;
      const profits = totalPrice - fees - checkInquiry.totalPrice;
      const transaction = await this.prismaService.$transaction(async (tx) => {
        const createTx = await tx.transactions.create({
          data: {
            paymentMethodType: checkPaymentMethod.type,
            idPaymentProvider: checkPaymentMethod.providerId,
            price: checkInquiry.totalPrice,
            totalPrice,
            productId: checkInquiry.product.id,
            productService: checkInquiry.product.productGroup.Services.name,
            fees,
            productName: checkInquiry.product.name,
            productPrice: checkInquiry.totalPrice,
            productQty: 1,
            id: checkInquiry.id,
            inputData: checkInquiry.customerNumber,
            orderRef: checkInquiry.id,
            paymentMethodId: checkPaymentMethod.id,
            profit: profits,
            userId: checkInquiry.userId,
            inquiryId: checkInquiry.id,
            expiredAt: new Date(expiredAt),
          },
        });

        const createPayment = await this.paymentService.createPayment({
          userId: userId,
          type: checkPaymentMethod.type,
          amount: createTx.price,
          amountTotal: createTx.totalPrice,
          fees: fees,
          feesInPercent: checkPaymentMethod.feesInPercent,
          description: createTx.productName,
          idPaymentMethodProvider: checkPaymentMethod.providerId,
          paymentMethodProvider: checkPaymentMethod.provider,
          trxId: createTx.id,
          phone: checkInquiry.phoneNumber,
          validTime: checkPaymentMethod.expiredInMinutes * 60,
        });

        if (!createPayment) {
          throw new CustomError(422, 'Failed to create payment');
        }

        const updateTransaction = await tx.transactions.update({
          where: {
            id: createTx.id,
          },
          data: {
            paidStatus: createPayment.status,
            // expiredAt: new Date(createPayment.expired),
            fees: Number(createPayment.fee),
            profit: profits,
            price: checkInquiry.totalPrice,
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
            trxId: createTx.id,
            paymentMethodProvider: checkPaymentMethod.provider,
          });

          throw new CustomError(422, 'Failed to update transaction');
        }

        await tx.transactionInquiry.delete({
          where: {
            id: checkInquiry.id,
          },
        });

        return updateTransaction;
      });

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
        data: transaction,
      };
    } catch (error) {
      Logger.error(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async getAllTransactionByAdmin(query: {
    page: number;
    limit: number;
    searchBy?: 'id' | 'userId';
    searchQuery?: string;
    sortBy: string;
    paidStatus?: PaidStatus;
    orderStatus?: OrderStatus;
    from?: Date;
    to?: Date;
  }) {
    try {
      const orderBy = {
        [query.sortBy?.split('.')[0]]: query.sortBy?.split('.')[1],
      };

      const getTransactions = await this.prismaService.transactions.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        where: {
          ...(query.searchQuery && {
            [query.searchBy]: {
              contains: query.searchQuery,
              mode: 'insensitive',
            },
          }),
          ...(query.paidStatus && {
            paidStatus: query.paidStatus,
          }),
          ...(query.orderStatus && {
            orderStatus: query.orderStatus,
          }),
          createdAt: {
            ...(query.from && {
              gte: new Date(query.from),
            }),
            ...(query.to && {
              lte: new Date(query.to),
            }),
          },
        },
        orderBy: {
          ...orderBy,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      const countTrx = await this.prismaService.transactions.count({
        where: {
          ...(query.searchQuery && {
            [query.searchBy]: {
              contains: query.searchQuery,
              mode: 'insensitive',
            },
          }),
          ...(query.paidStatus && {
            paidStatus: query.paidStatus,
          }),
          ...(query.orderStatus && {
            orderStatus: query.orderStatus,
          }),
          ...(query.from && {
            createdAt: {
              gte: new Date(query.from),
            },
          }),
          ...(query.to && {
            createdAt: {
              lte: new Date(query.to),
            },
          }),
        },
      });

      return {
        statusCode: 200,
        message: 'Success',
        pagination: {
          page: query.page,
          limit: query.limit,
          totalPage: Math.ceil(countTrx / query.limit),
          totalData: countTrx,
        },
        data: getTransactions,
      };
    } catch (error) {
      Logger.error(error.message);
      return {
        statusCode: error.statusCode || 500,
        message: error.publicMessage || 'Internal server error',
        data: [],
      };
      // throw new HttpException(
      //   error.publicMessage || 'Internal server error',
      //   error.statusCode || 500,
      // );
    }
  }

  async updateStatusTransaction(data: UpdateStatusTransactionDto) {
    try {
      const searchTrx = await this.prismaService.transactions.findUnique({
        where: {
          id: data.id,
        },
      });

      if (!searchTrx) {
        throw new CustomError(404, 'Transaction not found');
      }

      const updateTrx = await this.prismaService.transactions.update({
        where: {
          id: data.id,
        },
        data: {
          paidStatus: data.paidStatus,
          orderStatus: data.orderStatus,
          isRefunded: data.isRefunded,
          refundStatus: data.refundStatus,
        },
      });

      if (!updateTrx) {
        throw new CustomError(404, 'Transaction not found');
      }

      if (
        searchTrx.paidStatus != PaidStatus.PAID &&
        updateTrx.paidStatus == PaidStatus.PAID
      ) {
        await this.queueService.addTransactionProcessJob({
          trxId: updateTrx.id,
          status: 'PAID',
        });
      }

      if (!searchTrx.isRefunded && updateTrx.isRefunded) {
        await this.queueService.processRefund({
          isRefunded: updateTrx.isRefunded,
          refundStatus: updateTrx.refundStatus,
          trxId: updateTrx.id,
          userId: updateTrx.userId,
        });
      }

      return {
        statusCode: 200,
        message: 'Success',
        data: updateTrx,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
