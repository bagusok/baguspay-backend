import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { OrderStatus, PaymentAllowAccess } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CustomError } from 'src/common/custom.error';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { ChangeProfileByAdminDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: {
    page: number;
    limit: number;
    searchBy?: 'id' | 'username' | 'email';
    searchQuery?: string;
    sortBy: string;
    from?: Date;
    to?: Date;
  }) {
    const orderBy = {
      [query.sortBy?.split('.')[0]]: query.sortBy?.split('.')[1],
    };
    const users = await this.prismaService.user.findMany({
      where: {
        ...(query.searchQuery && {
          [query.searchBy]: {
            contains: query.searchQuery,
            mode: 'insensitive',
          },
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
    return {
      statusCode: 200,
      message: 'Success',
      data: users,
    };
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

  async getUserDetailByAdmin(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          loginHistory: true,
        },
      });

      if (!user) throw new CustomError(HttpStatus.NOT_FOUND, 'User not found');

      return {
        statusCode: 200,
        message: 'Success',
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async getUsersBalanceMutation(query: {
    page: number;
    limit: number;
    searchBy?: 'id' | 'userId';
    searchQuery?: string;
    sortBy: string;
    from?: Date;
    to?: Date;
  }) {
    const orderBy = {
      [query.sortBy?.split('.')[0]]: query.sortBy?.split('.')[1],
    };
    const users = await this.prismaService.balanceMutation.findMany({
      where: {
        ...(query.searchQuery && {
          [query.searchBy]: {
            contains: query.searchQuery,
            mode: 'insensitive',
          },
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
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    return {
      statusCode: 200,
      message: 'Success',
      data: users,
    };
  }

  async getChartTransactionByUser(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new CustomError(HttpStatus.NOT_FOUND, 'User not found');

      const result30Days: any = await this.prismaService.$queryRaw`
        SELECT
          date_trunc('day', "created_at") as day,
          "source_type",
          COUNT(*) as count,
          SUM("total_price") as total
        FROM
          "transactions"
        WHERE
          "created_at" >= current_date - interval '30 days' AND "order_status" = 'SUCCESS' AND "user_id" = ${userId}
        GROUP BY
          date_trunc('day', "created_at"),
          "source_type"
        ORDER BY
          day
      `;

      const result12Months: any = await this.prismaService.$queryRaw`
        SELECT
          date_trunc('month', "created_at") as month,
          "source_type",
          COUNT(*) as count,
          SUM("total_price") as total
        FROM
          "transactions"
        WHERE
          "created_at" >= current_date - interval '12 months' AND "order_status" = 'SUCCESS' AND "user_id" = ${userId}
        GROUP BY
          date_trunc('month', "created_at"),
          "source_type"
        ORDER BY
          month
      `;

      // Fill in the missing days for 30 days data
      const today = new Date();
      const days = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().slice(0, 10);
        const dayResults = result30Days.filter(
          (r) => r.day.toISOString().slice(0, 10) === formattedDate,
        );
        const counts = { mobile: 0, web: 0, all: 0 };
        const totals = { mobile: 0, web: 0, all: 0 };
        dayResults.forEach((r) => {
          const count = Number(r.count.toString());
          const total = Number(r.total.toString());
          if (r.source_type === 'MOBILE') {
            counts.mobile = count;
            totals.mobile = total;
          } else if (r.source_type === 'WEB') {
            counts.web = count;
            totals.web = total;
          }
          counts.all += count;
          totals.all += total;
        });
        days.push({
          day: formattedDate,
          counts,
          ...totals,
        });
      }

      // Fill in the missing months for 12 months data
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const formattedMonth = date.toLocaleString('default', {
          month: 'long',
        });
        const monthResults = result12Months.filter(
          (r) =>
            r.month.toISOString().slice(0, 7) ===
            date.toISOString().slice(0, 7),
        );
        const counts = { mobile: 0, web: 0, all: 0 };
        const totals = { mobile: 0, web: 0, all: 0 };
        monthResults.forEach((r) => {
          const count = Number(r.count.toString());
          const total = Number(r.total.toString());
          if (r.source_type === 'MOBILE') {
            counts.mobile = count;
            totals.mobile = total;
          } else if (r.source_type === 'WEB') {
            counts.web = count;
            totals.web = total;
          }
          counts.all += count;
          totals.all += total;
        });
        months.push({
          month: formattedMonth,
          counts: counts,
          ...totals,
        });
      }

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          last30Days: days,
          last12Months: months,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async getChartBalanceMutationByUser(userId: string) {
    try {
      const result30Days: any = await this.prismaService.$queryRaw`
      SELECT
        date_trunc('day', "created_at") as day,
        "type",
        SUM("amount") as amount
      FROM
        "balance_mutation"
      WHERE
        "created_at" >= current_date - interval '30 days' AND "user_id" = ${userId}
      GROUP BY
        date_trunc('day', "created_at"),
        "type"
      ORDER BY
        day
    `;

      const result12Months: any = await this.prismaService.$queryRaw`
      SELECT
        date_trunc('month', "created_at") as month,
        "type",
        SUM("amount") as amount
      FROM
        "balance_mutation"
      WHERE
        "created_at" >= current_date - interval '12 months' AND "user_id" = ${userId}
      GROUP BY
        date_trunc('month', "created_at"),
        "type"
      ORDER BY
        month
      `;

      const today = new Date();
      const days = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().slice(0, 10);
        const dayResults = result30Days.filter(
          (r) => r.day.toISOString().slice(0, 10) === formattedDate,
        );
        const totals = { in: 0, out: 0 };
        dayResults.forEach((r) => {
          const total = Number(r.amount.toString());
          if (r.type === 'IN') {
            totals.in = total;
          } else if (r.type === 'OUT') {
            totals.out = total;
          }
        });
        days.push({
          day: formattedDate,
          ...totals,
        });
      }

      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const formattedMonth = date.toLocaleString('default', {
          month: 'long',
        });
        const monthResults = result12Months.filter(
          (r) =>
            r.month.toISOString().slice(0, 7) ===
            date.toISOString().slice(0, 7),
        );

        const totals = { in: 0, out: 0 };
        monthResults.forEach((r) => {
          const total = Number(r.amount.toString());
          if (r.type === 'IN') {
            totals.in = total;
          } else if (r.type === 'OUT') {
            totals.out = total;
          }
        });
        months.push({
          month: formattedMonth,

          ...totals,
        });
      }

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          last30Days: days,
          last12Months: months,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async getUserDetail(userId: string) {
    try {
      const getUser = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          longName: true,
          role: true,
          balance: true,
          isBanned: true,
          isVerifEmail: true,
          isVerifPhone: true,
          verifiedAt: true,
          createdAt: true,
        },
      });

      if (!getUser) {
        throw new CustomError(HttpStatus.NOT_FOUND, 'User not found');
      }

      const sumUsedBalance = await this.prismaService.balanceMutation.aggregate(
        {
          where: {
            userId: userId,
            type: 'OUT',
            refType: {
              in: ['WITHDRAW', 'TRANSFER', 'TRANSACTION'],
            },
          },
          _sum: {
            amount: true,
          },
          _count: true,
        },
      );

      const sumTransaction = await this.prismaService.transactions.aggregate({
        where: {
          userId: userId,
          orderStatus: OrderStatus.SUCCESS,
        },
        _sum: {
          totalPrice: true,
        },
        _count: true,
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: {
          ...getUser,
          usedBalance: sumUsedBalance,
          totalTransaction: sumTransaction,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.status || 500,
      );
    }
  }

  async changeProfile(userId: string, data: ChangeProfileByAdminDto) {
    try {
      if (data.password !== data.confirmPassword) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          'Password and confirm password must be the same',
        );
      }

      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!checkUser) {
        throw new CustomError(HttpStatus.NOT_FOUND, 'User not found');
      }

      let hashPasword = null;
      if (data.password && data.password !== '') {
        hashPasword = await await bcrypt.hash(data.password, 10);
      }

      delete data.confirmPassword;

      const updateUser = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          ...data,
          ...(data.password && { password: hashPasword }),
        },
      });

      if (!updateUser) {
        throw new CustomError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed update user profile',
        );
      }

      if (
        checkUser.longName === updateUser.longName &&
        checkUser.username === updateUser.username &&
        checkUser.email === updateUser.email &&
        checkUser.phone === updateUser.phone &&
        checkUser.password === updateUser.password &&
        checkUser.role === updateUser.role &&
        checkUser.isBanned === updateUser.isBanned
      ) {
        return {
          statusCode: 200,
          message: 'Nothing to update user',
          data: {
            updated: false,
          },
        };
      }

      return {
        statusCode: 200,
        message: 'Success update user profile',
        data: {
          updated: true,
        },
      };
    } catch (error) {
      console.log(error.message);
      throw new HttpException(
        error.publicMessage || 'Internal Server Error',
        error.status || 500,
      );
    }
  }
}
