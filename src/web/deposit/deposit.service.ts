import { HttpException, Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/custom.error';
import { PaymentService } from 'src/modules/payment/payment.service';
import { BalanceService } from 'src/modules/payment/providers/balance/balance.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateDepositDto } from './deposit.dto';
import * as crypto from 'crypto';
import { PaymentAllowAccess } from '@prisma/client';

@Injectable()
export class DepositService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly balanceService: BalanceService,
    private readonly paymentService: PaymentService,
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
        { timeout: 10000 },
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
}
