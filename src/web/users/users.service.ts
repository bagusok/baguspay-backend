import { ForbiddenException, Injectable } from '@nestjs/common';
import { PaymentAllowAccess } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findUser(user: any) {
    if (user == null)
      return {
        statusCode: 200,
        data: {
          id: uuid(),
          longName: 'GUEST',
          phone: '00000000',
          email: 'guest@baguspay.com',
          role: 'GUEST',
          balance: 0,
        },
      };

    const get = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        longName: true,
        phone: true,
        email: true,
        role: true,
        balance: true,
      },
    });

    try {
      if (get) {
        return {
          statusCode: 200,
          message: 'Success',
          data: get,
        };
      } else {
        return {
          statusCode: 404,
          message: 'Not Found',
          data: null,
        };
      }
    } catch (error) {
      throw new ForbiddenException('Error');
    }
  }

  async getPaymentDeposit() {
    const checkPayment = await this.prismaService.paymentMethod.findMany({
      where: {
        paymentAllowAccess: {
          hasSome: [PaymentAllowAccess.DEPOSIT],
        },
        isAvailable: true,
      },
      orderBy: {
        type: 'asc',
      },
    });

    if (!checkPayment || checkPayment.length === 0) {
      return {
        statusCode: 404,
        message: 'Payment Notfound',
        data: [],
      };
    }

    const _datas = [];
    const payType = [];

    checkPayment.forEach((paymentMethod) => {
      let findPayTypeIndex = payType.findIndex((x) => x == paymentMethod.type);

      if (findPayTypeIndex === -1) {
        payType.push(paymentMethod.type);
        _datas.push({ type: paymentMethod.type, data: [] });

        findPayTypeIndex = _datas.length - 1;
      }

      _datas[findPayTypeIndex].data.push({
        id: paymentMethod.id,
        name: paymentMethod.name,
        desc: paymentMethod.desc,
        image: paymentMethod.image,
        minAmount: paymentMethod.minAmount,
        maxAmount: paymentMethod.maxAmount,
        fees: paymentMethod.fees,
        feesInPercent: paymentMethod.feesInPercent,
      });
    });

    return {
      statusCode: 200,
      message: 'Success',
      data: _datas,
    };
  }
}
