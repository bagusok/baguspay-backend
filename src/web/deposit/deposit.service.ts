import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CustomError } from 'src/common/custom.error';
import { PaymentService } from 'src/modules/payment/payment.service';
import { BalanceService } from 'src/modules/payment/providers/balance/balance.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateDepositDto, UpdateDepositDto } from './deposit.dto';
import * as crypto from 'crypto';
import { DepositStatus, PaymentAllowAccess } from '@prisma/client';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class DepositService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly balanceService: BalanceService,
    private readonly paymentService: PaymentService,
    private readonly queueService: QueueService,
  ) {}

  async createDeposit(userId: string, data: CreateDepositDto) {
    try {
      // check deposit pending
      // const checkDepositPending = await this.prismaService.deposit.findFirst({
      //   where: {
      //     userId,
      //     depositStatus: 'PENDING',
      //   },
      // });

      // if (checkDepositPending) {
      //   throw new CustomError(
      //     403,
      //     'Anda Memiliki Deposit yang pending, Silahkan selesaikan dulu',
      //   );
      // }

      //   check payment method
      const checkPaymentMethod =
        await this.prismaService.paymentMethod.findFirst({
          where: {
            id: data.paymentMethodId,
            paymentAllowAccess: {
              has: PaymentAllowAccess.DEPOSIT,
            },
          },
        });

      if (!checkPaymentMethod) {
        throw new CustomError(404, 'Payment method not found');
      }

      if (
        checkPaymentMethod.minAmount >= data.amount ||
        checkPaymentMethod.maxAmount <= data.amount
      ) {
        throw new CustomError(400, 'Amount not valid, please check again');
      }

      const transaction = await this.prismaService.$transaction(
        async (tx) => {
          const expiredAt =
            new Date().getTime() +
            checkPaymentMethod.expiredInMinutes * 60 * 1000;
          console.log(expiredAt);

          const calculateFees =
            Math.ceil(
              (data.amount * 100) /
                (100 - Number(checkPaymentMethod.feesInPercent)),
            ) - data.amount;

          const totalFees = checkPaymentMethod.fees + calculateFees;
          console.log(calculateFees, totalFees);

          const generateId = await this.generateTransactionId();

          const createDepo = await tx.deposit.create({
            data: {
              id: generateId,
              expiredAt: new Date(expiredAt),
              paymentMethodId: data.paymentMethodId,
              paymentMethodType: checkPaymentMethod.type,
              userId,
              amount: data.amount,
              fees: totalFees,
              total: data.amount + totalFees,
              depositStatus: 'PENDING',
              paymentName: checkPaymentMethod.name,
              idPaymentProvider: checkPaymentMethod.providerId,
            },
          });

          if (!createDepo) {
            throw new CustomError(500, 'Failed to create deposit');
          }

          const createPayment = await this.paymentService.createPayment({
            type: checkPaymentMethod.type,
            amount: createDepo.amount,
            amountTotal: createDepo.total,
            idPaymentMethodProvider: checkPaymentMethod.providerId,
            paymentMethodProvider: checkPaymentMethod.provider,
            trxId: createDepo.id,
            fees: totalFees,
            feesInPercent: checkPaymentMethod.feesInPercent,
            validTime: checkPaymentMethod.expiredInMinutes * 60,
            description: `Deposit ${createDepo.id}`,
          });

          if (!createPayment) {
            throw new CustomError(500, 'Failed to create payment');
          }

          console.log(createPayment);
          const updateTransaction = await tx.deposit.update({
            where: {
              id: createDepo.id,
            },
            data: {
              amount: createPayment.balance,
              fees: createPayment.fee,
              total: createPayment.amount,
              linkPayment: createPayment.linkPayment,
              isQrcode: createPayment.isQrcode,
              qrData: createPayment?.qrData,
              paymentNumber: createPayment?.pay_code,
              paymentRef: createPayment.ref,
            },
          });

          if (!updateTransaction) {
            throw new CustomError(500, 'Failed to update deposit');
          }

          return updateTransaction;
        },
        { timeout: 20000 },
      );

      return {
        statusCode: 200,
        message: 'Deposit berhasil dibuat',
        data: transaction,
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        err?.publicMessage ?? 'Internal Server Error',
        err?.statusCode ?? 500,
      );
    }
  }

  private async generateTransactionId() {
    function rand() {
      const date = new Date().getTime().toString();
      const random = crypto.randomBytes(5).toString('hex');

      return 'depo' + date + random;
    }

    let _rand = '';
    do {
      const gen = rand();
      const checkTransaction = await this.prismaService.deposit.findUnique({
        where: {
          id: gen,
        },
      });

      if (!checkTransaction) {
        _rand = gen;
        break;
      }
    } while (true);

    return _rand;
  }

  async getDepositDetail(depositId: string, userId: string) {
    try {
      const getDetail = await this.prismaService.deposit.findFirst({
        where: {
          id: depositId,
          userId,
        },
        include: {
          paymentMethod: true,
        },
      });

      if (!getDetail) {
        throw new CustomError(404, 'Deposit not found');
      }

      return {
        statusCode: 200,
        message: 'Success get deposit detail',
        data: getDetail,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async getDepositByUser(
    userId: string,
    {
      page,
      limit,
    }: {
      page: number;
      limit: number;
    },
  ) {
    if (!userId) {
      throw new ForbiddenException('Permission Denied');
    }

    try {
      const getDeposit = await this.prismaService.deposit.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          paymentMethod: true,
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const countDeposit = await this.prismaService.deposit.count({
        where: {
          userId,
        },
      });

      return {
        statusCode: 200,
        message: 'Success get deposit',
        pagination: {
          page,
          limit,
          totalData: countDeposit,
          totalPages: Math.ceil(countDeposit / limit),
        },
        data: getDeposit,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async getAllDepositByAdmin(query: {
    page: number;
    limit: number;
    searchBy?: 'id' | 'userId';
    searchQuery?: string;
    sortBy: string;
    depositStatus?: DepositStatus;
    from?: Date;
    to?: Date;
  }) {
    try {
      const orderBy = {
        [query.sortBy?.split('.')[0]]: query.sortBy?.split('.')[1],
      };

      const getDeposit = await this.prismaService.deposit.findMany({
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
          ...(query.depositStatus && {
            depositStatus: query.depositStatus,
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

      const countDeposit = await this.prismaService.deposit.count({
        where: {
          ...(query.searchQuery && {
            [query.searchBy]: {
              contains: query.searchQuery,
              mode: 'insensitive',
            },
          }),
          ...(query.depositStatus && {
            depositStatus: query.depositStatus,
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
          totalPage: Math.ceil(countDeposit / query.limit),
          totalData: countDeposit,
        },
        data: getDeposit,
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

  async getDepositById(depositId: string) {
    try {
      const getDeposit = await this.prismaService.deposit.findUnique({
        where: {
          id: depositId,
        },
      });

      if (!getDeposit) {
        throw new CustomError(404, 'Deposit not found');
      }

      return {
        statusCode: 200,
        message: 'Success get deposit',
        data: getDeposit,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async updateStatusDeposit(data: UpdateDepositDto) {
    try {
      const searchDepo = await this.prismaService.deposit.findUnique({
        where: {
          id: data.id,
        },
      });

      if (!searchDepo) {
        throw new CustomError(404, 'Deposit not found');
      }

      const updateDepo = await this.prismaService.deposit.update({
        where: {
          id: data.id,
        },
        data: {
          depositStatus: data.depositStatus,
          amount: data.amount,
          fees: data.fees,
          total: Number(data.amount) + Number(data.fees),
        },
      });

      if (!updateDepo) {
        throw new CustomError(404, 'Deposit not found');
      }

      if (
        [DepositStatus.SUCCESS, DepositStatus.PROCESS].find(
          (x) => x != searchDepo.depositStatus,
        ) &&
        updateDepo.depositStatus == DepositStatus.PROCESS
      ) {
        await this.queueService.addDepositProcessJob({
          depositId: updateDepo.id,
          amount: updateDepo.amount,
          status: updateDepo.depositStatus,
          userId: updateDepo.userId,
        });
      }

      return {
        statusCode: 200,
        message: 'Success',
        data: updateDepo,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
