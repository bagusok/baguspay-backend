import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ServiceGroupService } from 'src/web/services/service-group/service-group.service';
import { getPaymentMethodDto, getPaymentMethodInquiryDto } from './dtos/ui.dto';
import { CustomError } from 'src/common/custom.error';
import { PaymentAllowAccess } from '@prisma/client';

@Injectable()
export class UiService {
  constructor(
    private readonly serviceGroupService: ServiceGroupService,
    private readonly prismaService: PrismaService,
  ) {}

  async getPaymentMethod(data: getPaymentMethodDto, userId: string) {
    const checkProduct = await this.prismaService.products.findUniqueOrThrow({
      where: {
        id: data.productId,
      },
    });

    if (!checkProduct) {
      throw new NotFoundException('Product not found');
    }

    const totalProductPrice = checkProduct.price * data.qty;

    const checkPayment = await this.prismaService.paymentMethod.findMany({
      where: {
        minAmount: {
          lte: totalProductPrice,
        },
        maxAmount: {
          gte: totalProductPrice,
        },
        isAvailable: true,
        paymentAllowAccess: {
          hasSome: [PaymentAllowAccess.TRANSACTION],
        },
      },
      orderBy: {
        type: 'asc',
      },
    });

    if (!checkPayment || checkPayment.length === 0) {
      throw new NotFoundException('Payment method not found');
    }

    // Cek Saldo Jika UserId ada
    let balance = 0;

    if (userId) {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!checkUser) {
        throw new NotFoundException('User not found');
      }

      balance = checkUser.balance;
    }

    const _datas = [];
    let selected: any = {
      total: 100000000000000000,
    };
    const payType = [];

    checkPayment.forEach((paymentMethod) => {
      let findPayTypeIndex = payType.findIndex((x) => x == paymentMethod.type);

      if (findPayTypeIndex === -1) {
        if (paymentMethod.type == 'SALDO') {
          if (userId) {
            payType.push(paymentMethod.type);
            _datas.push({ type: paymentMethod.type, data: [] });

            findPayTypeIndex = _datas.length - 1;
          }
        } else {
          payType.push(paymentMethod.type);
          _datas.push({ type: paymentMethod.type, data: [] });

          findPayTypeIndex = _datas.length - 1;
        }
      }

      const totalPrice =
        Math.ceil(
          (totalProductPrice / (100 - Number(paymentMethod.feesInPercent))) *
            100,
        ) + paymentMethod.fees;

      const fees = totalPrice - totalProductPrice;

      // Untuk Mencari selected payment by default
      if (
        totalPrice >= paymentMethod.minAmount &&
        totalPrice <= paymentMethod.maxAmount
      ) {
        if (paymentMethod.type == 'SALDO') {
          if (userId) {
            if (selected.total > totalPrice && balance >= totalPrice) {
              selected = {
                id: paymentMethod.id,
                name:
                  paymentMethod.name +
                  ` (Rp. ${balance.toLocaleString('id-ID')})`,
                type: paymentMethod.type,
                desc: paymentMethod.desc,
                image: paymentMethod.image,
                productPrice: checkProduct.price,
                qty: data.qty,
                totalProductPrice: totalProductPrice,
                fees: fees,
                total: totalPrice,
                balance: balance,
              };
            }

            _datas[findPayTypeIndex].data.push({
              id: paymentMethod.id,
              name:
                paymentMethod.name +
                ` (Rp. ${balance.toLocaleString('id-ID')})`,
              desc: paymentMethod.desc,
              image: paymentMethod.image,
              productPrice: checkProduct.price,
              qty: data.qty,
              totalProductPrice: totalProductPrice,
              fees: fees,
              total: totalPrice,
              balance: balance,
            });
          }
        } else {
          if (selected.total > totalPrice) {
            selected = {
              id: paymentMethod.id,
              name: paymentMethod.name,
              type: paymentMethod.type,
              desc: paymentMethod.desc,
              image: paymentMethod.image,
              productPrice: checkProduct.price,
              qty: data.qty,
              totalProductPrice: totalProductPrice,
              fees: fees,
              total: totalPrice,
            };
          }

          _datas[findPayTypeIndex].data.push({
            id: paymentMethod.id,
            name: paymentMethod.name,
            desc: paymentMethod.desc,
            image: paymentMethod.image,
            productPrice: checkProduct.price,
            qty: data.qty,
            totalProductPrice: totalProductPrice,
            fees: fees,
            total: totalPrice,
          });
        }
      }
    });

    return {
      statusCode: 200,
      selected,
      message: 'Success',
      data: _datas,
    };
  }

  async getPaymentMethodInquiry(
    data: getPaymentMethodInquiryDto,
    userId?: string,
  ) {
    try {
      const checkInquiry =
        await this.prismaService.transactionInquiry.findUnique({
          where: {
            id: data.inquiryId,
          },
        });

      if (!checkInquiry) {
        throw new CustomError(404, 'Inquiry not found');
      }

      const checkPayment = await this.prismaService.paymentMethod.findMany({
        where: {
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
        orderBy: {
          type: 'asc',
        },
      });

      if (!checkPayment || checkPayment.length === 0) {
        throw new NotFoundException('Payment method not found');
      }

      let balance = 0;

      if (userId) {
        const checkUser = await this.prismaService.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!checkUser) {
          throw new NotFoundException('User not found');
        }

        balance = checkUser.balance;
      }

      const _datas = [];
      let selected: any = {
        total: 100000000000000000,
      };
      const payType = [];

      checkPayment.forEach((paymentMethod) => {
        let findPayTypeIndex = payType.findIndex(
          (x) => x == paymentMethod.type,
        );

        if (findPayTypeIndex === -1) {
          if (paymentMethod.type == 'SALDO') {
            if (userId) {
              payType.push(paymentMethod.type);
              _datas.push({ type: paymentMethod.type, data: [] });

              findPayTypeIndex = _datas.length - 1;
            }
          } else {
            payType.push(paymentMethod.type);
            _datas.push({ type: paymentMethod.type, data: [] });

            findPayTypeIndex = _datas.length - 1;
          }
        }

        const totalPrice =
          Math.ceil(
            (checkInquiry.totalPrice /
              (100 - Number(paymentMethod.feesInPercent))) *
              100,
          ) + paymentMethod.fees;

        const fees = totalPrice - checkInquiry.totalPrice;

        // Untuk Mencari selected payment by default
        if (
          totalPrice >= paymentMethod.minAmount &&
          totalPrice <= paymentMethod.maxAmount
        ) {
          if (paymentMethod.type == 'SALDO') {
            if (userId) {
              if (selected.total > totalPrice) {
                selected = {
                  id: paymentMethod.id,
                  name:
                    paymentMethod.name +
                    ` (Rp. ${balance.toLocaleString('id-ID')})`,
                  type: paymentMethod.type,
                  desc: paymentMethod.desc,
                  image: paymentMethod.image,
                  productPrice: checkInquiry.totalPrice,
                  qty: 1,
                  totalProductPrice: checkInquiry.totalPrice,
                  fees: fees,
                  total: totalPrice,
                  balance: balance,
                };
              }

              _datas[findPayTypeIndex].data.push({
                id: paymentMethod.id,
                name:
                  paymentMethod.name +
                  ` (Rp. ${balance.toLocaleString('id-ID')})`,
                desc: paymentMethod.desc,
                image: paymentMethod.image,
                productPrice: checkInquiry.totalPrice,
                qty: 1,
                totalProductPrice: checkInquiry.totalPrice,
                fees: fees,
                total: totalPrice,
                balance: balance,
              });
            }
          } else {
            if (selected.total > totalPrice) {
              selected = {
                id: paymentMethod.id,
                name: paymentMethod.name,
                type: paymentMethod.type,
                desc: paymentMethod.desc,
                image: paymentMethod.image,
                productPrice: checkInquiry.totalPrice,
                qty: 1,
                totalProductPrice: checkInquiry.totalPrice,
                fees: fees,
                total: totalPrice,
              };
            }

            _datas[findPayTypeIndex].data.push({
              id: paymentMethod.id,
              name: paymentMethod.name,
              desc: paymentMethod.desc,
              image: paymentMethod.image,
              productPrice: checkInquiry.totalPrice,
              qty: 1,
              totalProductPrice: checkInquiry.totalPrice,
              fees: fees,
              total: totalPrice,
            });
          }
        }
      });

      return {
        statusCode: 200,
        selected,
        message: 'Success',
        data: _datas,
      };
    } catch (err) {
      throw new HttpException(
        err.publicMessage || 'Internal Server Error',
        err.statusCode || 500,
      );
    }
  }
}
